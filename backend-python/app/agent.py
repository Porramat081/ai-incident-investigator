from fastapi import APIRouter , HTTPException
from pydantic import BaseModel
import requests
from app import mocks,template,agent_tools

router = APIRouter(prefix="/api/agent")

OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"

AVAILABLE_TOOLS = {
    "get_recent_git_commits": agent_tools.get_recent_git_commits,
    "execute_server_diagnostic_command": agent_tools.execute_server_diagnostic_command
}

class InvestigationRequest(BaseModel):
    incident_query:str

@router.get("/check-agent")
def agent_check():
    return {
            "status" : "agent-access",
            "engine" : "python-ai-vector-core"
        }

@router.post("/investigate")
def run_autonomous_investigation(payload:InvestigationRequest):
    try:
        tools_definition = mocks.tools_definition
        message = template.query_message(payload.incident_query)
        ollama_payload = {
            "model":"qwen2.5:7b-instruct",
            "messages":message,
            "tools":tools_definition,
            "stream":False
        }

        response = requests.post(OLLAMA_CHAT_URL,json=ollama_payload,timeout=30).json()
        message_result = response.get("message",{})

        if "tool_calls" in message_result:
            tool_steps_summary = []
            for tool_call in message_result["tool_calls"]:
                function_name = tool_call["function"]["name"]
                arguments = tool_call["function"]["arguments"]

                if function_name in AVAILABLE_TOOLS:
                    print(function_name)
                    print(f"🛠️ Agent executing local tool: {function_name} with args {arguments}")
                    tool_function = AVAILABLE_TOOLS[function_name]
                    tool_output = tool_function(**arguments)

                    tool_steps_summary.append({
                        "tool_used": function_name,
                        "arguments": arguments,
                        "result": tool_output
                    })

                    message.append(message_result)
                    message.append({
                        "role": "tool",
                        "name": function_name,
                        "content": str(tool_output)
                    })
            final_payload = {
                "model": "qwen2.5:7b-instruct",
                "messages": message,
                "stream": False
            }
            final_response = requests.post(OLLAMA_CHAT_URL, json=final_payload, timeout=30).json()
            return {
                "steps_taken": tool_steps_summary,
                "final_root_cause_analysis": final_response["message"]["content"]
            }
        return {
            "steps_taken": [],
            "final_root_cause_analysis": message_result.get("content", "No actions required.")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent runtime failure: {str(e)}")