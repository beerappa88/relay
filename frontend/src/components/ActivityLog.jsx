import { useEffect, useRef } from "react";

export default function ActivityLog({ entries }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-text-secondary">
          Signal log
        </h2>
        <span className="h-1.5 w-1.5 rounded-full bg-signal-teal" />
      </div>
      <div
        ref={scrollRef}
        aria-live="polite"
        className="h-36 space-y-2 overflow-y-auto pr-1 font-mono text-xs leading-relaxed"
      >
        {entries.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-text-secondary/60">No activity yet</p>
            <p className="text-[10px] text-text-secondary/40">Click "Run a task" above to start the pipeline</p>
          </div>
        )}
        {entries.map((entry, i) => (
          <p key={i} className="border-l border-line/70 pl-3 text-text-secondary">
            <span className="mr-2 text-signal-amber/80">{entry.time}</span>
            {entry.text}
          </p>
        ))}
      </div>
    </div>
  );
}
