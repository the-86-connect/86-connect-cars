-- Knowledge base for admin AI chat assistant
-- Uses pgvector (2048 dims = GLM embedding-3)
-- Storage: ~10KB per chunk (8KB embedding + 1KB text + 0.5KB metadata)

-- Enable vector extension
create extension if not exists vector;

-- Document metadata (the .docx binary is discarded after processing)
create table if not exists kb_documents (
  id text primary key,
  title text not null,
  filename text not null,
  chunk_count integer not null default 0,
  char_count integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Text chunks + embeddings
create table if not exists kb_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id text not null references kb_documents(id) on delete cascade,
  content text not null,
  embedding vector(2048) not null,
  chunk_index integer not null,
  metadata jsonb default '{}'::jsonb
);

-- HNSW index for fast cosine similarity search
create index if not exists kb_chunks_embedding_idx
  on kb_chunks using hnsw (embedding vector_cosine_ops);

-- Index for doc-level lookups/deletes
create index if not exists kb_chunks_doc_id_idx on kb_chunks(doc_id);

-- Soft-delete filter index
create index if not exists kb_documents_deleted_at_idx on kb_documents(deleted_at);

-- Similarity search RPC (used by Supabase .rpc() call)
-- Filters out soft-deleted documents
create or replace function match_kb_chunks(
  query_embedding vector(2048),
  match_count integer default 5
)
returns table (
  id uuid,
  doc_id text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    c.id,
    c.doc_id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from kb_chunks c
  inner join kb_documents d on d.id = c.doc_id
  where d.deleted_at is null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- Storage monitor: total disk usage of kb_* tables (data + indexes)
-- Returns bytes — used by admin UI storage card
create or replace function get_kb_storage_bytes()
returns bigint
language sql stable
as $$
  select coalesce(
    pg_total_relation_size('kb_chunks') +
    pg_total_relation_size('kb_documents'),
    0
  );
$$;

-- Chunk count for storage stats
create or replace function get_kb_chunk_count()
returns bigint
language sql stable
as $$
  select count(*) from kb_chunks c
  inner join kb_documents d on d.id = c.doc_id
  where d.deleted_at is null;
$$;
