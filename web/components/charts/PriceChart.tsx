"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
  LineStyle,
} from "lightweight-charts";
import type { Annotation, Bar } from "@/lib/types";

type Props = {
  bars: Bar[];
  annotations?: Annotation;
  height?: number;
  showVolume?: boolean;
};

function toTime(t: string): Time {
  if (t.length === 10) return t as Time; // YYYY-MM-DD
  return Math.floor(new Date(t).getTime() / 1000) as UTCTimestamp;
}

export default function PriceChart({ bars, annotations, height = 420, showVolume = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#11161d" },
        textColor: "#d8dee9",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      },
      grid: {
        vertLines: { color: "#1f2630" },
        horzLines: { color: "#1f2630" },
      },
      rightPriceScale: { borderColor: "#1f2630" },
      timeScale: { borderColor: "#1f2630", timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
    });
    chartRef.current = chart;

    const candles = chart.addCandlestickSeries({
      upColor: "#4ade80",
      downColor: "#f87171",
      borderUpColor: "#4ade80",
      borderDownColor: "#f87171",
      wickUpColor: "#4ade80",
      wickDownColor: "#f87171",
    });
    candles.setData(
      bars.map((b) => ({
        time: toTime(b.time),
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      })),
    );

    let volSeries: ISeriesApi<"Histogram"> | null = null;
    if (showVolume) {
      volSeries = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "",
        color: "#334155",
      });
      volSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volSeries.setData(
        bars.map((b) => ({
          time: toTime(b.time),
          value: b.volume,
          color: b.close >= b.open ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)",
        })),
      );
    }

    // Trendlines as line series
    annotations?.trendlines?.forEach((tl) => {
      const s = chart.addLineSeries({
        color: tl.color ?? "#4ade80",
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      s.setData([
        { time: toTime(String(tl.x1)), value: tl.y1 },
        { time: toTime(String(tl.x2)), value: tl.y2 },
      ]);
      if (tl.label) {
        candles.createPriceLine({
          price: tl.y2,
          color: tl.color ?? "#4ade80",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: tl.label,
        });
      }
    });

    // Zones as pair of price lines (approximation in Lightweight Charts)
    annotations?.zones?.forEach((z) => {
      candles.createPriceLine({
        price: z.yTop,
        color: z.color ?? "rgba(74,222,128,0.6)",
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: z.label ? `${z.label} ↑` : "",
      });
      candles.createPriceLine({
        price: z.yBottom,
        color: z.color ?? "rgba(74,222,128,0.6)",
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: z.label ? `${z.label} ↓` : "",
      });
    });

    // Markers
    if (annotations?.markers?.length) {
      candles.setMarkers(
        annotations.markers.map((m) => ({
          time: toTime(String(m.x)),
          position: m.shape === "arrowDown" ? "aboveBar" : "belowBar",
          color: m.color ?? "#4ade80",
          shape:
            m.shape === "arrowUp" ? "arrowUp" : m.shape === "arrowDown" ? "arrowDown" : "circle",
          text: m.text,
        })),
      );
    }

    chart.timeScale().fitContent();

    const onResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [bars, annotations, height, showVolume]);

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}
