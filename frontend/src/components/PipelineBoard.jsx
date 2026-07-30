import { useEffect, useRef, useState } from "react";
import { Play, RotateCw } from "lucide-react";
import AgentNode from "./AgentNode.jsx";
import ActivityLog from "./ActivityLog.jsx";
import { fetchAgents } from "../api.js";

const PROCESS_MS = 900;
const FLOW_MS = 700;

const LOG_LINES = [
  "Intake Agent received request #A-1042 and marked it new.",
  "Handing off to Extraction Agent…",
  "Extraction Agent pulled Invoice #4521, Amount $340, Customer Jane Doe.",
  "Handing off to Validation Agent…",
  "Validation Agent confirmed invoice #4521 exists and the amount matches.",
  "Handing off to Approval Agent…",
  "Approval Agent approved request #A-1042. Task closed.",
];

function timeNow() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

export default function PipelineBoard() {
  const [agents, setAgents] = useState([]);
  const [connectors, setConnectors] = useState(["idle", "idle", "idle"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [log, setLog] = useState([]);
  const timeouts = useRef([]);

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  const pushLog = (text) => setLog((prev) => [...prev, { time: timeNow(), text }]);

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeouts.current.push(id);
  };

  const runTask = () => {
    if (running || agents.length === 0) return;
    setRunning(true);
    setLog([]);
    setActiveStep(null);
    setCompletedSteps(0);
    setConnectors(["idle", "idle", "idle"]);
    setAgents((prev) => prev.map((a) => ({ ...a, status: "idle" })));

    let t = 0;
    agents.forEach((_, i) => {
      schedule(() => {
        setActiveStep(i);
        setAgents((prev) => prev.map((a, idx) => (idx === i ? { ...a, status: "active" } : a)));
        pushLog(LOG_LINES[i * 2]);
      }, t);
      t += PROCESS_MS;

      schedule(() => {
        setActiveStep(null);
        setCompletedSteps(i + 1);
        setAgents((prev) => prev.map((a, idx) => (idx === i ? { ...a, status: "done" } : a)));
        if (i < agents.length - 1) {
          setConnectors((prev) => prev.map((c, idx) => (idx === i ? "flowing" : c)));
          pushLog(LOG_LINES[i * 2 + 1]);
        }
      }, t);

      if (i < agents.length - 1) {
        t += FLOW_MS;
        schedule(() => {
          setConnectors((prev) => prev.map((c, idx) => (idx === i ? "done" : c)));
        }, t);
      }
    });

    schedule(() => {
      setRunning(false);
      setActiveStep(null);
    }, t + 200);
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 font-mono text-sm text-text-secondary">
        <RotateCw size={16} className="animate-spin" />
        Connecting to RELAY backend…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-signal-red/40 bg-signal-red/5 p-6 text-sm text-signal-red">
        Couldn't reach the backend at the configured API URL ({error}). Make sure the FastAPI
        server is running on port 8000.
      </div>
    );
  }

  const currentAgent = activeStep !== null ? agents[activeStep] : null;
  const progressPercent = agents.length > 0 ? Math.round((completedSteps / agents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Ticket pipeline
          </h2>
          <p className="text-sm text-text-secondary">
            One request, four agents, in fixed order.
          </p>
        </div>
        <button
          onClick={runTask}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-lg bg-signal-amber px-4 py-2 font-display text-sm font-semibold text-ink transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play size={16} fill="currentColor" />
          {running ? "Task in flight…" : "Run a task"}
        </button>
      </div>

      <div className={`rounded-2xl border border-line bg-surface/60 p-4 transition-all duration-500 ${progressPercent === 100 && !running ? "shadow-[0_0_32px_rgba(79,209,174,0.25)]" : "shadow-[0_0_0_1px_rgba(35,45,56,0.4)]"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.24em] transition-all duration-300 ${
              running ? "border-signal-amber/40 bg-signal-amber/10 text-signal-amber" 
              : progressPercent === 100 ? "border-signal-teal/50 bg-signal-teal/15 text-signal-teal shadow-[0_0_12px_rgba(79,209,174,0.3)]"
              : completedSteps > 0 ? "border-signal-teal/40 bg-signal-teal/10 text-signal-teal" 
              : "border-line bg-surface2 text-text-secondary"
            }`}>
              {running ? "Live run" : progressPercent === 100 ? "✓ Success" : completedSteps > 0 ? "Completed" : "Ready"}
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-text-secondary">
                Signal route
              </p>
              <p className="font-display text-sm font-semibold text-text-primary">
                {running && currentAgent
                  ? `Stepping through ${currentAgent.name}`
                  : progressPercent === 100
                  ? "Task approved and closed ✓"
                  : completedSteps > 0
                  ? `${completedSteps}/${agents.length} stages completed`
                  : "Waiting for a new ticket"}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-text-secondary">
            {agents.length > 0 ? `${progressPercent}% complete` : "No agents loaded"}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full transition-all duration-300 ${running ? "bg-signal-amber" : "bg-signal-teal"}`}
            style={{ width: `${Math.max(progressPercent, running ? 4 : 0)}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface/40 p-5 sm:p-6">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-stretch sm:gap-0">
          {agents.map((agent, i) => (
            <div key={agent.id} className="flex w-full flex-col sm:w-1/4 sm:px-2">
              <AgentNode agent={agent} index={i} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between px-2 sm:mt-6">
          {connectors.map((state, i) => (
            <div key={`connector-${i}`} className="relative flex flex-1 items-center justify-center">
              <div className="h-1 flex-1 rounded-full bg-line/40 sm:h-1 sm:bg-line/60">
                {state === "flowing" && (
                  <div className="absolute inset-y-0 h-2.5 w-2.5 rounded-full bg-signal-amber shadow-glow animate-flowX" />
                )}
                {state === "done" && (
                  <div className="h-full w-full rounded-full bg-signal-teal/50" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ActivityLog entries={log} />
    </div>
  );
}
