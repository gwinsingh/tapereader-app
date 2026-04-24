import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "TapeReader — read the tape",
  description:
    "Free US-stock setup scanner. Active and forming setups, annotated charts, and top movers for discretionary traders.",
  openGraph: {
    title: "TapeReader",
    description: "Read the tape. Active setups, forming setups, annotated charts.",
    url: "https://tapereader.us",
    siteName: "TapeReader",
    type: "website",
  },
  twitter: { card: "summary", title: "TapeReader", description: "Read the tape." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
