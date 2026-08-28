import { InvestigationResponse } from "@/app/page";
import { CheckCircle } from "lucide-react";

interface LogViewProps {
  loading: boolean;
  agentOutput: InvestigationResponse | null;
}

export default function LogView({ loading, agentOutput }: LogViewProps) {
  return (
    <section className="lg:col-span-2 space-y-6">
      {/* Section A: Agent Action Trace Steps */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Autonomous Tool Execution Trace
        </h2>
        {!agentOutput && !loading && (
          <p className="text-slate-500 text-sm italic">
            System idle. Awaiting incident trigger query initiation...
          </p>
        )}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
        )}
        {agentOutput?.steps_taken.map((step, idx) => (
          <div
            key={idx}
            className="mb-4 p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs"
          >
            <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              [TOOL INVOCATION] -{">"} {step.tool_used}
            </div>
            <div className="text-slate-400 mb-2">
              Args: {JSON.stringify(step.arguments)}
            </div>
            <div className="bg-slate-900 p-2 text-slate-300 max-h-24 overflow-y-auto rounded border border-slate-800">
              {step.result.output || JSON.stringify(step.result)}
            </div>
          </div>
        ))}
      </div>

      {/* Section B: Root Cause Markdown Text Synthesis Analysis Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          AI Final Root Cause Diagnosis
        </h2>
        {!agentOutput && !loading && (
          <p className="text-slate-500 text-sm italic">
            No current report active.
          </p>
        )}
        {loading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-slate-800 rounded"></div>
            <div className="h-4 bg-slate-800 rounded"></div>
            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          </div>
        )}
        {agentOutput && (
          <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-slate-300 leading-relaxed text-sm whitespace-pre-line">
            {agentOutput.final_root_cause_analysis}
          </div>
        )}
      </div>
    </section>
  );
}
