import { Cpu, ShieldAlert } from "lucide-react";

interface HeaderPanelProps {
  handleTriggerChaos: () => void;
  chaosStatus: "idle" | "triggered";
}

export default function HeaderPanel(props: HeaderPanelProps) {
  return (
    <header className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-cyan-400 flex items-center gap-2">
          <Cpu className="w-6 h-6 animate-pulse" />
          AI-Powered Production Incident Investigator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Autonomous SRE Log Diagnostics Stack • 100% Free Local AI Stack
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={props.handleTriggerChaos}
          className={`px-4 py-2 font-medium rounded-md flex items-center gap-2 transition ${
            props.chaosStatus === "triggered"
              ? "bg-rose-900/40 text-rose-300 border border-rose-700"
              : "bg-rose-600 hover:bg-rose-500 text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Trigger Chaos Outage
        </button>
      </div>
    </header>
  );
}
