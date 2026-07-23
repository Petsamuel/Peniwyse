"use client";

import React, { useState, useEffect } from "react";
import { FiActivity } from "react-icons/fi";
import Image from "next/image";
import BrandLogo from "@/app/assets/images/brand.png";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ErrorBar,
  Rectangle,
} from "recharts";
import mockChartData from "./data.json";

export interface MarketCandle {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

const barDataKey = (entry: MarketCandle): [number, number] => [
  Math.min(entry.close, entry.open),
  Math.max(entry.close, entry.open),
];

const whiskerDataKey = (entry: MarketCandle): [number, number] => {
  const highEnd = Math.max(entry.close, entry.open);
  return [highEnd - entry.low, entry.high - highEnd];
};

const Candlestick = (props: unknown) => {
  const { open, close, ...rest } = props as React.ComponentProps<typeof Rectangle> & { open: number; close: number };
  const isProfit = close > open;
  return (
    <Rectangle
      {...rest}
      fill={isProfit ? "#22c55e" : "#ef4444"}
      fillOpacity={0.7}
    />
  );
};

export default React.memo(function MarketPulse() {
  const [masterData, setMasterData] = useState<MarketCandle[]>(() => {
    const data = [...mockChartData];
    while (data.length < 80) {
      const lastCandle = data[data.length - 1];
      const trend = (Math.random() - 0.5) * 2; 
      const open = lastCandle.close;
      const change = trend * 12;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 8;
      const low = Math.min(open, close) - Math.random() * 8;
      data.push({
        time: 0, // placeholder, will be overwritten
        open, close, high, low
      });
    }

    // Anchor the last candle to right now, and step backwards by 1 hour (3600000ms)
    const now = Date.now();
    for (let i = 0; i < data.length; i++) {
      data[i].time = now - (data.length - 1 - i) * 3600000;
    }

    return data as MarketCandle[];
  });

  useEffect(() => {
    const speed = 12000;
    const baseVolatility = 25;

    const interval = setInterval(() => {
      setMasterData((prevData) => {
        const lastCandle = prevData[prevData.length - 1];
        
        const trend = (Math.random() - 0.5) * 2; 
        
        const open = lastCandle.close;
        const change = trend * baseVolatility;
        const close = open + change;
        
        const high = Math.max(open, close) + Math.random() * (baseVolatility * 0.8);
        const low = Math.min(open, close) - Math.random() * (baseVolatility * 0.8);
        
        const newCandle: MarketCandle = {
          time: lastCandle.time + 3600000, // 1 hour step
          open,
          close,
          high,
          low
        };

        const newData = [...prevData, newCandle];
        if (newData.length > 80) return newData.slice(newData.length - 80);
        return newData;
      });
    }, speed);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[45%] bg-[#081729] flex-col p-6 lg:p-10 xl:p-12 relative h-full overflow-hidden lg:flex hidden">
      {/* Subtle Radial Gradient */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(21,150,254,0.15),transparent)] pointer-events-none" /> */}

      <div className="relative z-10 flex flex-col h-full animate-in fade-in slide-in-from-left-8 duration-700">
        {/* Brand Logo - Top Left */}
        <div className="flex items-center gap-4 mb-10 group">
          <div className="h-auto w-10 shrink-0 overflow-hidden flex items-center justify-center">
            <Image
              src={BrandLogo}
              alt="Logo"
              className="h-full w-full object-contain scale-[1.8] translate-y-[5%]"
            />
          </div>
          <span className="text-2xl font-semibold text-white tracking-tighter -ml-4">
            TradeBlott<span className="text-[#1596fe] font-black">r</span>
          </span>
        </div>

        {/* Market Hub Section */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-4 text-left">
            <p className="text-muted-theme text-sm max-w-sm leading-relaxed">
              Access your secure dashboard to manage global liquidity and
              execution.
            </p>
          </div>

          {/* Embedded Chart & Stats */}
          <div className="bg-card-bg/[0.03] backdrop-blur-md rounded-2xl p-6 lg:p-8 mb-2 group transition-all w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-2">
                <FiActivity className="text-[#1596fe]" size={20} />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-100">
                  Live Market Pulse
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[8px] font-bold text-muted-theme uppercase tracking-tighter">
                      Profit
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="text-[8px] font-bold text-muted-theme uppercase tracking-tighter">
                      Loss
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={masterData.slice(-60)}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }} 
                  stroke="rgba(255,255,255,0.1)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  tickMargin={10}
                  minTickGap={30}
                />
                <YAxis 
                  domain={["dataMin - 10", "dataMax + 10"]} 
                  orientation="right"
                  stroke="rgba(255,255,255,0.1)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  tickFormatter={(val) => val.toFixed(0)}
                  tickMargin={10}
                />
                <Bar
                  dataKey={barDataKey}
                  shape={Candlestick}
                  isAnimationActive={false}
                >
                  <ErrorBar
                    dataKey={whiskerDataKey}
                    width={1}
                    strokeWidth={1}
                    stroke="rgba(255,255,255,0.2)"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Market Sparklines Section */}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-6 border-t border-white/5">
            {[
              {
                name: "Bitcoin",
                symbol: "BTC",
                price: "$98,127",
                change: "+2.4%",
                trend: "up",
                data: [40, 35, 50, 45, 60, 55, 70],
              },
              {
                name: "Ethereum",
                symbol: "ETH",
                price: "$3,412",
                change: "-1.2%",
                trend: "down",
                data: [60, 55, 58, 50, 52, 45, 40],
              },
              {
                name: "Solana",
                symbol: "SOL",
                price: "$145.2",
                change: "+5.1%",
                trend: "up",
                data: [30, 40, 35, 50, 48, 65, 75],
              },
              {
                name: "Cardano",
                symbol: "ADA",
                price: "$0.45",
                change: "+0.8%",
                trend: "up",
                data: [50, 48, 52, 51, 55, 54, 58],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card-bg/5 border border-white/5 rounded-xl p-3 hover:bg-card-bg/10 transition-all group/card"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${item.trend === "up" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"}`}
                    />
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-theme group-hover/card:text-slate-200 transition-colors">
                      {item.symbol}
                    </span>
                  </div>
                  <span
                    className={`text-[7px] font-bold ${item.trend === "up" ? "text-green-500" : "text-red-500"}`}
                  >
                    {item.change}
                  </span>
                </div>
                <p className="text-[10px] font-black text-white mb-2 tracking-tight">
                  {item.price}
                </p>
                <div className="h-8 w-full opacity-60 group-hover/card:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%" minHeight={20}>
                    <AreaChart data={item.data.map((v) => ({ v }))}>
                      <defs>
                        <linearGradient
                          id={`gradient-${i}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={
                              item.trend === "up" ? "#22c55e" : "#ef4444"
                            }
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={
                              item.trend === "up" ? "#22c55e" : "#ef4444"
                            }
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={item.trend === "up" ? "#22c55e" : "#ef4444"}
                        fill={`url(#gradient-${i})`}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
