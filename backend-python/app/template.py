def query_message(incident_query):
    messages = [
            {
                "role": "system", 
                "content": "You are an elite SRE Agent. Investigate issues step-by-step. If you require code history or resource parameters, invoke your system tools. Do not guess."
            },
            {"role": "user", "content": incident_query}
        ]
    return messages