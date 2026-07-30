const STATUS_MAP = {
  idle: { label: "Idle", dot: "bg-signal-idle", text: "text-text-secondary" },
  active: { label: "Active", dot: "bg-signal-amber", text: "text-signal-amber" },
  done: { label: "Done", dot: "bg-signal-teal", text: "text-signal-teal" },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs tracking-wide ${s.text}`}>
      <span className="relative flex h-2 w-2">
        {status === "active" && (
          <span className={`ping-ring absolute inline-flex h-full w-full rounded-full ${s.dot}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      {s.label.toUpperCase()}
    </span>
  );
}
