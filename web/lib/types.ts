export type Timeframe = "daily" | "15m" | "5m";

export type SetupStatus = "forming" | "active" | "triggered" | "invalidated";

export type SetupType =
  | "breakout_high"
  | "pullback_ema"
  | "inside_day"
  | "nr7"
  | "vol_dryup"
  | "gap_go";

export const SETUP_LABELS: Record<SetupType, string> = {
  breakout_high: "Breakout above N-day high",
  pullback_ema: "Pullback to key EMA",
  inside_day: "Inside Day",
  nr7: "NR7 (Narrow Range 7)",
  vol_dryup: "Volume Dry-Up Coil",
  gap_go: "Gap-and-Go",
};

export type Bar = {
  time: string; // ISO date or datetime
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Ticker = {
  symbol: string;
  name: string;
  sector?: string;
  lastPrice: number;
  changePct: number;
  volume: number;
  asOf: string;
};

export type Annotation = {
  trendlines?: { x1: string | number; y1: number; x2: string | number; y2: number; color?: string; label?: string }[];
  zones?: { yTop: number; yBottom: number; color?: string; label?: string }[];
  markers?: {
    x: string | number;
    price: number;
    shape: "arrowUp" | "arrowDown" | "circle";
    text?: string;
    color?: string;
  }[];
};

export type Setup = {
  id: string;
  ticker: string;
  type: SetupType;
  status: SetupStatus;
  timeframe: Timeframe;
  detectedAt: string;
  triggerPrice: number;
  stopHint?: number;
  targetHint?: number;
  notes?: string;
  annotations: Annotation;
};

export type Mover = {
  symbol: string;
  name: string;
  lastPrice: number;
  changePct: number;
  volume: number;
  relVolume: number; // vs 20-day avg
};
