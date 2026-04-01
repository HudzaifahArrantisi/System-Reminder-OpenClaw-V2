CREATE TABLE IF NOT EXISTS ukt_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  student_user_id UUID NOT NULL REFERENCES users(id),
  issued_by_user_id UUID NOT NULL REFERENCES users(id),
  term TEXT NOT NULL,
  amount_due NUMERIC(14,2) NOT NULL CHECK (amount_due >= 0),
  amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  status invoice_status_enum NOT NULL DEFAULT 'pending',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ukt_invoices_student_status ON ukt_invoices(student_user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ukt_invoices_due_date ON ukt_invoices(due_at, status) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS ukt_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES ukt_invoices(id),
  payer_user_id UUID NOT NULL REFERENCES users(id),
  payment_method payment_method_enum NOT NULL,
  status payment_status_enum NOT NULL DEFAULT 'pending',
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  external_ref TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ukt_payments_invoice_status ON ukt_payments(invoice_id, status) WHERE deleted_at IS NULL;
