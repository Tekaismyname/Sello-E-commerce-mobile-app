import { cartService } from "@/services/customer.service";
import { Cart, Order, OrderItem } from "@/types/customer";

const isSameCartLine = (cartItem: Cart["items"][number], orderItem: OrderItem) =>
  cartItem.productId === orderItem.productId &&
  (cartItem.variantId ?? null) === (orderItem.variantId ?? null);

const findOrderCartItemIds = (cart: Cart, orderItems: OrderItem[]) =>
  new Set(
    cart.items
      .filter((cartItem) => orderItems.some((orderItem) => isSameCartLine(cartItem, orderItem)))
      .map((cartItem) => cartItem.id),
  );

export async function prepareOrderItemsForCheckout(token: string, order: Order) {
  if (!order.items.length) {
    throw new Error("This order does not have products to buy again.");
  }

  const currentCart = await cartService.getCart(token);

  for (const item of currentCart.data.items) {
    if (item.selected) {
      await cartService.selectCartItem(token, item.id, { selected: false });
    }
  }

  for (const item of order.items) {
    await cartService.addCartItem(token, {
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: item.quantity || 1,
    });
  }

  const refreshedCart = await cartService.getCart(token);
  const checkoutItemIds = findOrderCartItemIds(refreshedCart.data, order.items);

  for (const item of refreshedCart.data.items) {
    const shouldSelect = checkoutItemIds.has(item.id);

    if (item.selected !== shouldSelect) {
      await cartService.selectCartItem(token, item.id, { selected: shouldSelect });
    }
  }
}
