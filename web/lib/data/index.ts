import type { Bar, Mover, Setup, Ticker, Timeframe } from "../types";
import {
  fixtureBars,
  fixtureMovers,
  fixtureSetup,
  fixtureSetups,
  fixtureTicker,
  fixtureTickers,
  fixtureUniverse,
} from "./fixtures";

// Single data interface used by every page. Today: fixtures.
// Tomorrow: replace these implementations with Turso SQL queries
// (see ./turso.ts for the stub). The rest of the app will not need to change.

export type DataSource = {
  getActiveSetups(): Promise<Setup[]>;
  getFormingSetups(): Promise<Setup[]>;
  getTopMovers(): Promise<Mover[]>;
  getTicker(symbol: string): Promise<Ticker | null>;
  getTickers(): Promise<Ticker[]>;
  getBars(symbol: string, timeframe: Timeframe): Promise<Bar[]>;
  getSetup(id: string): Promise<Setup | null>;
  getSetupsForTicker(symbol: string): Promise<Setup[]>;
  getUniverse(): Promise<{ symbol: string; name: string }[]>;
};

export const data: DataSource = {
  async getActiveSetups() {
    return fixtureSetups().filter((s) => s.status === "active" || s.status === "triggered");
  },
  async getFormingSetups() {
    return fixtureSetups().filter((s) => s.status === "forming");
  },
  async getTopMovers() {
    return fixtureMovers();
  },
  async getTicker(symbol) {
    return fixtureTicker(symbol);
  },
  async getTickers() {
    return fixtureTickers();
  },
  async getBars(symbol, timeframe) {
    return fixtureBars(symbol, timeframe);
  },
  async getSetup(id) {
    return fixtureSetup(id);
  },
  async getSetupsForTicker(symbol) {
    return fixtureSetups().filter((s) => s.ticker === symbol.toUpperCase());
  },
  async getUniverse() {
    return fixtureUniverse();
  },
};
