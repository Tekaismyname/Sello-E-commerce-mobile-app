import { Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

type RevenuePoint = {
  period: string;
  revenue: number;
};

type StatusPoint = {
  status: string;
  total: number;
};

type AdminSalesChartProps = {
  currentRevenue?: number;
  revenueByPeriod?: RevenuePoint[];
  revenueByDay?: RevenuePoint[];
  statusDistribution?: StatusPoint[];
  todayRevenue?: number;
  yesterdayRevenue?: number;
};

const STATUS_COLORS = ["#006397", "#12805C", "#873DA6", "#E8A300", "#BA1A1A", "#64748B"];

const STATUS_COLOR_BY_KEY: Record<string, string> = {
  delivered: "#12805C",
  cancelled: "#BA1A1A",
  returned: "#92400E",
  return_requested: "#E8A300",
  shipping: "#006397",
  packed: "#2F95D2",
  confirmed: "#873DA6",
  pending: "#64748B",
};

const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
};

const formatCurrency = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

const formatPeriodLabel = (period: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return period.slice(5);
  return period;
};

const getStatusLabel = (status: string) => {
  if (status === "return_requested") return "return";
  return status.replace("_", " ");
};

const getStatusColor = (status: string, index: number) =>
  STATUS_COLOR_BY_KEY[status] ?? STATUS_COLORS[index % STATUS_COLORS.length];

export function AdminSalesChart({
  currentRevenue,
  revenueByPeriod,
  revenueByDay,
  statusDistribution,
  todayRevenue,
  yesterdayRevenue,
}: AdminSalesChartProps) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(260, Math.min(width - 72, 360));
  const chartHeight = 120;
  const revenueData = revenueByDay?.length ? revenueByDay.slice(-7) : revenueByPeriod ?? [];
  const singlePeriodRevenue = currentRevenue ?? revenueData[0]?.revenue ?? 0;
  const maxRevenue = Math.max(...revenueData.map((item) => item.revenue), 1);
  const hasDailyComparison = todayRevenue !== undefined && yesterdayRevenue !== undefined;
  const revenueChangePercent =
    hasDailyComparison && yesterdayRevenue! > 0
      ? ((todayRevenue! - yesterdayRevenue!) / yesterdayRevenue!) * 100
      : hasDailyComparison && todayRevenue! > 0
        ? 100
        : 0;
  const isRevenueUp = revenueChangePercent >= 0;
  const points = revenueData.map((item, index) => {
    const x = revenueData.length === 1 ? chartWidth / 2 : (index / (revenueData.length - 1)) * chartWidth;
    const y = chartHeight - (item.revenue / maxRevenue) * (chartHeight - 16) - 8;
    return { ...item, x, y };
  });
  const statusData = (statusDistribution ?? []).filter((item) => item.total > 0).slice(0, 6);
  const statusTotal = statusData.reduce((sum, item) => sum + item.total, 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let accumulatedLength = 0;

  return (
    <View className="rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <View className="mb-8 flex-row items-center justify-between">
        <View>
          <Text className="text-[18px] font-extrabold text-[#191C1F]">Revenue Analysis</Text>
          <Text className="mt-0.5 text-[12px] text-[#6b7682]">Revenue summary and order status distribution</Text>
        </View>
        {hasDailyComparison ? (
          <View
            className={`flex-row items-center gap-1 rounded-[8px] px-3 py-1.5 ${
              isRevenueUp ? "bg-[#E7F6EE]" : "bg-[#FFF1F0]"
            }`}
          >
            <Text className={`text-[12px] font-bold ${isRevenueUp ? "text-[#12805C]" : "text-[#BA1A1A]"}`}>
              {isRevenueUp ? "▲" : "▼"} {Math.abs(revenueChangePercent).toFixed(1)}%
            </Text>
          </View>
        ) : (
          <View className="rounded-[8px] bg-[#F4F5F7] px-3 py-1.5">
            <Text className="text-[12px] font-bold text-[#3F4850]">Synced</Text>
          </View>
        )}
      </View>

      {hasDailyComparison ? (
        <View className="mb-4 flex-row gap-3">
          <View className="flex-1 rounded-[14px] bg-[#F8F9FB] p-4">
            <Text className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6b7682]">Today</Text>
            <Text className="mt-2 text-[18px] font-extrabold text-[#191C1F]">{formatCurrency(todayRevenue!)}</Text>
          </View>
          <View className="flex-1 rounded-[14px] bg-[#F8F9FB] p-4">
            <Text className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6b7682]">Yesterday</Text>
            <Text className="mt-2 text-[18px] font-extrabold text-[#191C1F]">{formatCurrency(yesterdayRevenue!)}</Text>
          </View>
        </View>
      ) : null}

      <View className="rounded-[14px] bg-[#F8F9FB] p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[13px] font-extrabold text-[#191C1F]">
            {revenueData.length >= 2 ? "Revenue trend" : "Revenue summary"}
          </Text>
          {revenueData.length >= 2 ? (
            <Text className="text-[12px] font-bold text-[#006397]">{formatCompactCurrency(maxRevenue)} peak</Text>
          ) : null}
        </View>
        {revenueData.length >= 2 ? (
          <>
            <Svg width={chartWidth} height={chartHeight}>
              <Polyline
                points={points.map((item) => `${item.x},${item.y}`).join(" ")}
                fill="none"
                stroke="#006397"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((item) => (
                <Circle key={`${item.period}-${item.x}`} cx={item.x} cy={item.y} r={4.5} fill="#006397" />
              ))}
            </Svg>
            <View className="mt-2 flex-row justify-between">
              {points.map((item) => (
                <Text key={item.period} className="max-w-[48px] text-center text-[10px] font-bold text-[#6b7682]" numberOfLines={1}>
                  {formatPeriodLabel(item.period)}
                </Text>
              ))}
            </View>
          </>
        ) : revenueData.length === 1 ? (
          <View className="rounded-[12px] bg-white p-4">
            <Text className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6B7280]">Current period revenue</Text>
            <Text className="mt-2 text-[26px] font-extrabold text-[#006397]">{formatCurrency(singlePeriodRevenue)}</Text>
            <Text className="mt-3 text-[12px] leading-[18px] text-[#6b7682]">Period: {revenueData[0]!.period}</Text>
          </View>
        ) : (
          <View className="rounded-[12px] bg-white p-4">
            <Text className="text-[13px] text-[#6b7682]">No revenue trend data yet.</Text>
          </View>
        )}
      </View>

      <View className="mt-4 rounded-[14px] bg-[#F8F9FB] p-4">
        <Text className="text-[13px] font-extrabold text-[#191C1F]">Order status distribution</Text>
        {statusTotal > 0 ? (
          <View className="mt-4 flex-row items-center">
            <Svg width={120} height={120}>
              {statusData.map((item, index) => {
                const segmentLength = (item.total / statusTotal) * circumference;
                const strokeDashoffset = -accumulatedLength;
                accumulatedLength += segmentLength;

                return (
                  <Circle
                    key={item.status}
                    cx={60}
                    cy={60}
                    r={radius}
                    fill="none"
                    stroke={getStatusColor(item.status, index)}
                    strokeWidth={22}
                    strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 60 60)"
                  />
                );
              })}
              <Circle cx={60} cy={60} r={28} fill="#F8F9FB" />
            </Svg>
            <View className="ml-4 flex-1 gap-2">
              {statusData.map((item, index) => (
                <View key={item.status} className="flex-row items-center justify-between">
                  <View className="mr-3 flex-1 flex-row items-center">
                    <View
                      className="mr-2 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getStatusColor(item.status, index) }}
                    />
                    <Text className="flex-1 text-[12px] font-semibold capitalize text-[#3F4850]" numberOfLines={1}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                  <Text className="text-[12px] font-extrabold text-[#191C1F]">{item.total}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text className="mt-3 text-[13px] text-[#6b7682]">No order status report data yet.</Text>
        )}
      </View>
    </View>
  );
}
