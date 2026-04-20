"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendData {
  date: string;
  count: number;
}

interface IncidentTrendChartProps {
  data: TrendData[];
}

export function IncidentTrendChart({ data }: IncidentTrendChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-4 bg-card border-border h-[400px] flex flex-col shadow-xl rounded-2xl overflow-hidden group">
      <CardHeader className="pb-2 pt-6 px-6">
        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Spatio-Temporal Analysis (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-6 px-2 pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }}
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }}
              dx={-5}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                color: 'hsl(var(--foreground))',
                padding: '12px',
                fontSize: '12px',
                fontWeight: '900'
              }}
              itemStyle={{ color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorCount)" 
              animationDuration={2000}
              activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))', className: "shadow-lg" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
