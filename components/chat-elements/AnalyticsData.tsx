"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

interface AnalyticsDataItem {
  Day: string;
  "Number Visits": number;
  "Number Visitors": number;
}

interface AnalyticsDataProps {
  data: AnalyticsDataItem[];
}

export function AnalyticsData({ data }: AnalyticsDataProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Calculate total visits, sessions and date range
  const totalVisits = data.reduce(
    (sum: number, item: AnalyticsDataItem) => sum + item["Number Visits"],
    0
  );
  const totalVisitors = data.reduce(
    (sum: number, item: AnalyticsDataItem) =>
      sum + (item["Number Visitors"] || 0),
    0
  );
  const firstDate = new Date(data[0].Day);
  const lastDate = new Date(data[data.length - 1].Day);
  const dateRange = `${firstDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${lastDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  // Chart configuration with high contrast colors
  const chartConfig = {
    visits: {
      label: "Number Visits",
      color: "hsl(221, 83%, 53%)", // Blue
    },
    visitors: {
      label: "Number Visitors",
      color: "hsl(0, 72%, 51%)", // Red/Orange
    },
  } satisfies ChartConfig;

  return (
    <Card className="my-4 w-full max-w-full">
      <CardHeader>
        <CardTitle>Content Analytics</CardTitle>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <ChartContainer config={chartConfig} className="w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
            aria-label={`Line chart showing daily visits from ${dateRange}`}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="Day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="Number Visits"
              type="monotone"
              stroke="var(--color-visits)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Number Visitors"
              type="monotone"
              stroke="var(--color-visitors)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Total: {totalVisits.toLocaleString()} visits,{" "}
              {totalVisitors.toLocaleString()} visitors{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing daily visits and visitors for the last 30 days
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

