import requests

NODE_MOCK_SERVER = "http://127.0.0.1:3000"

def get_recent_git_commits(service_name: str) -> dict:
    """Queries the mock GitHub engine for deployment changes."""
    try:
        res = requests.get(f"{NODE_MOCK_SERVER}/api/mock-github/commits", params={"service_name": service_name}, timeout=3)
        return res.json()
    except Exception as e:
        return {"error": f"Failed to contact GitHub system: {str(e)}"}

def execute_server_diagnostic_command(command: str) -> dict:
    """Queries the server terminal tool to inspect live OS hardware footprints."""
    try:
        res = requests.post(f"{NODE_MOCK_SERVER}/api/mock-terminal/exec", json={"command": command}, timeout=3)
        return res.json()
    except Exception as e:
        return {"error": f"Failed to run server terminal check: {str(e)}"}