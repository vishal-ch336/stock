import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DailyNetData } from "@/types";

interface PurchasesSalesChartProps {
  data: DailyNetData[];
}

export const PurchasesSalesChart = ({ data }: PurchasesSalesChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Purchases vs Sales (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="purchases"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={false}
              name="Purchases"
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={false}
              name="Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
