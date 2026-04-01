CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti UUID NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by_jti UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_user_active
  ON auth_refresh_tokens(user_id, expires_at DESC)
  WHERE revoked_at IS NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_expires
  ON auth_refresh_tokens(expires_at)
  WHERE revoked_at IS NULL AND deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_auth_refresh_tokens_set_updated_at ON auth_refresh_tokens;
CREATE TRIGGER trg_auth_refresh_tokens_set_updated_at
  BEFORE UPDATE ON auth_refresh_tokens
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
