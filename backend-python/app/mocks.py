tools_definition = [
            {
                "type": "function",
                "function": {
                    "name": "get_recent_git_commits",
                    "description": "Fetch recent deployment git history changes for a microservice to track bad code versions.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "service_name": {"type": "string", "description": "Name of the target service like PaymentService"}
                        },
                        "required": ["service_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "execute_server_diagnostic_command",
                    "description": "Execute diagnostic commands like 'free -m' or 'df -h' to read live server memory or resource statuses.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "command": {"type": "string", "description": "The command string to execute."}
                        },
                        "required": ["command"]
                    }
                }
            }
        ]