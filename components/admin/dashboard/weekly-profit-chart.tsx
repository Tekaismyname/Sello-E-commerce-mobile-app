import { Text, View } from "react-native";

type RevenuePoint = {
  period: string;
  revenue: number;
};

type WeeklyProfitChartProps = {
  revenueByDay?: RevenuePoint[];
};

const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_BAR_HEIGHT = 140;

const toLabel = (period: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const date = new Date(period);
    if (!Number.isNaN(date.getTime())) return WEEKDAY_ABBR[date.getDay()];
    return period.slice(5);
  }
  return period;
};

const formatMillions = (value: number) => {
  const millions = value / 1_000_000;
  if (millions >= 10) return `${Math.round(millions)}M`;
  if (millions >= 1) return `${millions.toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(Math.round(value));
};

export function WeeklyProfitChart({ revenueByDay }: WeeklyProfitChartProps) {
  const last7 = (revenueByDay ?? []).slice(-7);

  if (last7.length < 2) return null;

  const maxRevenue = Math.max(...last7.map((d) => d.revenue), 1);

  return (
    <View className="mt-4 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <Text className="text-[16px] font-bold text-[#191C1F]">Profit – Last 7 Days</Text>
      <Text className="mt-1 text-[12px] text-[#6b7682]">Unit: million VND</Text>

      <View className="mt-5 flex-row items-end justify-between" style={{ height: MAX_BAR_HEIGHT + 24 }}>
        {last7.map((item, index) => {
          const isPeak = item.revenue === maxRevenue && maxRevenue > 0;
          const barHeight = Math.max(4, (item.revenue / maxRevenue) * MAX_BAR_HEIGHT);

          return (
            <View key={`${item.period}-${index}`} className="flex-1 items-center">
              <Text className="mb-1 text-[9px] font-bold text-[#44515F]">{formatMillions(item.revenue)}</Text>
              <View
                style={{ height: barHeight, backgroundColor: isPeak ? "#EE4D2D" : "#006397" }}
                className="w-[62%] rounded-t-[6px]"
              />
              <Text className="mt-1.5 text-[10px] font-semibold text-[#6b7682]">{toLabel(item.period)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
