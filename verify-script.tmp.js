const { createHmac } = require('node:crypto');

const SECRET = 'sello-local-secret';
const ISSUER = 'sello-ecommerce-api';
const BASE = 'http://localhost:3000';

function b64url(str) {
  return Buffer.from(str).toString('base64url');
}

function sign(payload, expiresInSeconds = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { iss: ISSUER, iat: now, exp: now + expiresInSeconds, ...payload };
  const eh = b64url(JSON.stringify(header));
  const ep = b64url(JSON.stringify(body));
  const sig = createHmac('sha256', SECRET).update(`${eh}.${ep}`).digest('base64url');
  return `${eh}.${ep}.${sig}`;
}

const ADMIN_PERMS = [
  'system:dashboard:read','users:read','users:status:update','users:role:update',
  'orders:read','orders:update','products:read','products:create','products:update',
  'products:status:update','reports:read','reports:export','system:config:update',
  'categories:read','categories:create','categories:update','categories:delete',
  'brands:read','brands:create','brands:update','vouchers:read','vouchers:create',
  'vouchers:update','vouchers:delete','notifications:read','notifications:create',
  'reviews:read','reviews:moderate','chats:read',
];

const customerToken = sign({ sub: 9, role: 'customer', type: 'access' });
const adminToken = sign({ sub: 4, role: 'admin', type: 'access', permissions: ADMIN_PERMS });

async function call(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

(async () => {
  console.log('=== STEP 1: add item to cart (customer 9) ===');
  let r = await call('POST', '/cart/items', customerToken, { productId: 1, variantId: 1, quantity: 1 });
  console.log(r.status, JSON.stringify(r.json));

  console.log('\n=== STEP 2: create order (addressId=3, paymentMethodId=1/COD) ===');
  r = await call('POST', '/orders', customerToken, { addressId: 3, paymentMethodId: 1 });
  console.log(r.status, JSON.stringify(r.json));
  const newOrderId = r.json?.data?.orderId ?? r.json?.data?.id;
  console.log('NEW ORDER ID:', newOrderId);

  if (!newOrderId) {
    console.log('FAILED to create order, aborting further steps');
    return;
  }

  console.log('\n=== STEP 3: cancel order WITH reasonCode + note ===');
  r = await call('POST', `/orders/${newOrderId}/cancel`, customerToken, {
    reasonCode: 'SHIPPING_TOO_SLOW',
    note: 'verify-script: delivery estimate too long for me',
  });
  console.log(r.status, JSON.stringify(r.json));

  console.log('\n=== STEP 4: fetch order detail (customer) - check statusHistory has reasonCode+note ===');
  r = await call('GET', `/orders/${newOrderId}`, customerToken);
  console.log(r.status, JSON.stringify(r.json?.data?.statusHistory));

  console.log('\n=== STEP 5: return-request on delivered order (order_id=1) WITHOUT note (reasonCode only) ===');
  r = await call('POST', `/orders/1/return-request`, customerToken, { reasonCode: 'DAMAGED' });
  console.log(r.status, JSON.stringify(r.json));

  console.log('\n=== STEP 6: fetch order 1 detail - check description falls back to reason LABEL ===');
  r = await call('GET', `/orders/1`, customerToken);
  console.log(r.status, JSON.stringify(r.json?.data?.statusHistory));

  console.log('\n=== STEP 7: admin listOrders - check statusHistory now populated for cancelled/return orders ===');
  r = await call('GET', '/admin/orders', adminToken);
  const adminOrders = Array.isArray(r.json?.data) ? r.json.data : r.json?.data?.items;
  const newOrderInList = adminOrders?.find((o) => o.id === newOrderId);
  const order1InList = adminOrders?.find((o) => o.id === 1);
  console.log('status:', r.status);
  console.log('newOrder in admin list statusHistory:', JSON.stringify(newOrderInList?.statusHistory));
  console.log('order1 in admin list statusHistory:', JSON.stringify(order1InList?.statusHistory));

  console.log('\n=== STEP 8: admin getOrderDetail for the new cancelled order ===');
  r = await call('GET', `/admin/orders/${newOrderId}`, adminToken);
  console.log(r.status, JSON.stringify(r.json?.data?.statusHistory));

  console.log('\n=== STEP 9: admin report overview - check revenueByDay/todayRevenue/yesterdayRevenue ===');
  r = await call('GET', '/admin/reports/overview', adminToken);
  console.log(r.status, JSON.stringify({
    revenueByDay: r.json?.data?.revenueByDay,
    todayRevenue: r.json?.data?.todayRevenue,
    yesterdayRevenue: r.json?.data?.yesterdayRevenue,
    orderStatusDistribution: r.json?.data?.orderStatusDistribution,
  }));

  console.log('\n=== PROBE: cancel an already-cancelled order (should fail gracefully) ===');
  r = await call('POST', `/orders/${newOrderId}/cancel`, customerToken, { reasonCode: 'OTHER' });
  console.log(r.status, JSON.stringify(r.json));

  console.log('\n=== PROBE: return-request with invalid/missing reasonCode and no note ===');
  r = await call('POST', `/orders/1/return-request`, customerToken, {});
  console.log(r.status, JSON.stringify(r.json));

  console.log('\n=== PROBE: cancel with unrecognized reasonCode string ===');
  r = await call('POST', '/orders/' + newOrderId + '/cancel', customerToken, { reasonCode: 'NOT_A_REAL_CODE' });
  console.log(r.status, JSON.stringify(r.json));
})();
