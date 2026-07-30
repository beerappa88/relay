import { Inbox, ScanSearch, ShieldCheck, GaugeCircle } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

const ICONS = [Inbox, ScanSearch, ShieldCheck, GaugeCircle];

const STATUS_RING = {
  idle: "border-line shadow-[0_0_0_1px_rgba(35,45,56,0.18)]",
  active: "border-signal-amber/70 shadow-glow",
  done: "border-signal-teal/50 shadow-[0_0_0_1px_rgba(79,209,174,0.2)]",
};

const STATUS_TOP = {
  idle: "before:bg-line",
  active: "before:bg-signal-amber",
  done: "before:bg-signal-teal",
};

export default function AgentNode({ agent, index, total = 4 }) {
  const Icon = ICONS[index] ?? Inbox;
  const ring = STATUS_RING[agent.status] ?? STATUS_RING.idle;
  const accent = STATUS_TOP[agent.status] ?? STATUS_TOP.idle;

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label={`Agent ${agent.name}`}
      className={`group relative flex min-h-56 w-full flex-col justify-between gap-3 overflow-hidden rounded-lg border bg-surface/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface2 focus-visible:bg-surface2 ${ring} ${accent} before:absolute before:inset-x-0 before:top-0 before:h-1 before:transition-colors before:duration-300`}
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs text-text-secondary">{String(agent.id).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
        <StatusBadge status={agent.status} />
      </div>

      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
            agent.status === "active"
              ? "border-signal-amber/50 bg-signal-amber/10 text-signal-amber"
              : agent.status === "done"
              ? "border-signal-teal/40 bg-signal-teal/10 text-signal-teal"
              : "border-line bg-surface2 text-text-secondary"
          }`}
        >
          <Icon size={20} strokeWidth={1.75} />
        </div>

        <div className="flex-1">
          <h3 className="font-display text-base font-semibold text-text-primary">{agent.name}</h3>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
            {agent.role}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{agent.description}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-3">
        {(agent.permissions ?? []).map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="rounded-full border border-line bg-surface2/60 px-2 py-0.5 font-mono text-[10px] text-text-secondary"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
