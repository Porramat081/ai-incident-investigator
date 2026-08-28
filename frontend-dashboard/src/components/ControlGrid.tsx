import { Play, RefreshCw, Terminal } from "lucide-react";

interface ControlGridProps {
  loading: boolean;
  runAIAgentInvestigation: () => void;
}

export default function ControlGrid(props: ControlGridProps) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Terminal className="w-5 h-5 text-cyan-400" />
        Investigation Terminal
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Click below to invoke your local{" "}
        <code className="text-cyan-300">Qwen-2.5-7B</code> AI Agent model. It
        will inspect your database logs and execute diagnostic terminal commands
        dynamically.
      </p>

      <button
        onClick={props.runAIAgentInvestigation}
        disabled={props.loading}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
      >
        {props.loading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
            Agent Executing Tools...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current text-slate-950" />
            Analyze Live Incident
          </>
        )}
      </button>
    </section>
  );
}
