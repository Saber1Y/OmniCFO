-- OmniCFO Database Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id TEXT UNIQUE NOT NULL,
  vendor_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN (
      'DRAFT',
      'PENDING_APPROVAL',
      'AUTO_APPROVED',
      'MANUALLY_APPROVED',
      'REJECTED',
      'PAYMENT_INITIATED',
      'PAID',
      'PAYMENT_FAILED'
    )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  payment_id TEXT,
  telegram_message_id INTEGER,
  metadata JSONB
);

-- Index for fast lookups by invoice_id
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_id ON invoices (invoice_id);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Policy settings table (single-row, key-value for persistence)
CREATE TABLE IF NOT EXISTS policy_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  rules JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce single row
CREATE UNIQUE INDEX IF NOT EXISTS policy_settings_single_row ON policy_settings (id);

-- Vendors table
CREATE TABLE IF NOT EXISTS policy_vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  trusted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS policy_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule TEXT NOT NULL,
  action TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  detail TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_audit_timestamp ON policy_audit (timestamp DESC);
