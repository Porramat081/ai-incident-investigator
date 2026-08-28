"use client";

import ControlGrid from "@/components/ControlGrid";
import HeaderPanel from "@/components/HeaderPanel";
import LogView from "@/components/LogView";
import { useState } from "react";

interface ToolStep {
  tool_used: string;
  arguments: any;
  result: { output?: string; history?: any };
}

export interface InvestigationResponse {
  steps_taken: ToolStep[];
  final_root_cause_analysis: string;
}

export default function IncidentDashboard() {
  const [loading, setLoading] = useState(false);
  const [chaosStatus, setChaosStatus] = useState<"idle" | "triggered">("idle");
  const [agentOutput, setAgentOutput] = useState<InvestigationResponse | null>(
    null,
  );

  const handleTriggerChaos = async () => {
    setChaosStatus("triggered");
    try {
      await fetch("http://localhost:3000/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: "PaymentService",
          log_level: "FATAL",
          raw_message:
            "Mannual Trigger: Connection injection anomaly forced by admin panel dashboard payload handle.",
        }),
      });
      alert("🔥 Chaos Cascade injected into production log streams!");
    } catch (err) {
      console.error("Failed to inject infrastructure chaos", err);
    }
  };

  const runAIAgentInvestigation = async () => {
    setLoading(true);
    setAgentOutput(null);
    try {
      const response = await fetch(
        "http://localhost:8000/api/agent/investigate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incident_query:
              "The payment system is currently reporting 500 errors and degrading downstream. Run system diagnostics and verify git deployment updates.",
          }),
        },
      );
      const data = await response.json();
      setAgentOutput(data);
    } catch (err) {
      console.error("Local AI execustion failure", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <HeaderPanel
        chaosStatus={chaosStatus}
        handleTriggerChaos={handleTriggerChaos}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ControlGrid
          loading={loading}
          runAIAgentInvestigation={runAIAgentInvestigation}
        />
        <LogView loading={loading} agentOutput={agentOutput} />
      </div>
    </main>
  );
}
