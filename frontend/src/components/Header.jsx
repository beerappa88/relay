import { Radio } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-10">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-signal-amber/40 bg-signal-amber/10 text-signal-amber">
          <Radio size={18} strokeWidth={1.75} />
        </div>
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-text-primary">RELAY</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
            Agent pipeline console
          </p>
        </div>
      </div>
      <span className="hidden font-mono text-xs text-text-secondary sm:inline">
        AlassaTech — Engineering Assignment
      </span>
    </header>
  );
}
