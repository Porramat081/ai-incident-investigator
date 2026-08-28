from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from app import agent

app = FastAPI(title="AI Incident Vector Service")

app.include_router(agent.router)

print("🧠 Loading local SentenceTransformer model into system memory...")

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print("✅ Model loaded. Vector Engine fully online.")

class EmbeddingRequest(BaseModel):
    text:str

class EmbeddingResponse(BaseModel):
    embedding:list[float]

@app.get("/api/health")
def health_check():
    return {
        "status" : "healthy",
        "engine" : "python-ai-vector-core"
    }

@app.post("/api/embed" , response_model = EmbeddingResponse)
def generate_log_embedding(payload:EmbeddingRequest):
    try:
        if not payload.text.strip():
            raise HTTPException(status_code=400,detail="Text field cannot be empty")
        vector_result = embedding_model.encode(payload.text).tolist()
        return {"embedding":vector_result}
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Embedding calculation failure: {str(e)}")