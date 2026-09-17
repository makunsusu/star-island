CREATE TABLE IF NOT EXISTS accounts (
 id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL,
 nickname text NOT NULL DEFAULT '小冒险家', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS saves (
 user_id uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
 progress jsonb NOT NULL, challenge jsonb, revision integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY,user_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS resets (
 token_hash text PRIMARY KEY,user_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS operations (
 user_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,request_id uuid NOT NULL,kind text NOT NULL,result jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,request_id)
);
CREATE TABLE IF NOT EXISTS coin_ledger (
 id bigserial PRIMARY KEY,user_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,delta integer NOT NULL,reason text NOT NULL,
 reference text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,reason,reference)
);
