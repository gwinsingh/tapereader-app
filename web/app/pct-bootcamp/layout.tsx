import ThemeToggle from "@/components/trade-journal/ThemeToggle";
import PCTBodyStyle from "@/components/trade-journal/PCTBodyStyle";

export default function PCTBootcampLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PCTBodyStyle />
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between border-b py-3" style={{ borderColor: "var(--color-border)" }}>
            <span className="font-mono text-sm font-bold" style={{ color: "var(--color-accent)" }}>
              PCT Bootcamp
            </span>
            <ThemeToggle />
          </div>
          <div className="py-6">{children}</div>
        </div>
      </div>
    </>
  );
}
