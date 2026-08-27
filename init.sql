-- Step 1: Enable the required vector extension inside your designated database
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Generate the core log storage table schema
CREATE TABLE IF NOT EXISTS production_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    log_level VARCHAR(20) NOT NULL,
    raw_message TEXT NOT NULL,
    -- 384 dimensions matches our Week 2 local embedding model requirements
    message_embedding vector(384), 
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Step 3: Attach a high-scale HNSW index for optimized vector searching
CREATE INDEX IF NOT EXISTS production_logs_embedding_hnsw_idx 
ON production_logs USING hnsw (message_embedding vector_cosine_ops);
