import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://zobgiuzmslxukkbpajhj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmdpdXptc2x4dWtrYnBhamhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODU5NjQ3NywiZXhwIjoyMTA0MTcyNDc3fQ.Jy9pKD5BfXg5WuMYx7Aa4Fp4_AeiupWX_c90a6V6TJQ"
);

const sql = `
CREATE TABLE IF NOT EXISTS policy_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  rules JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS policy_settings_single_row ON policy_settings (id);

CREATE TABLE IF NOT EXISTS policy_vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  trusted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule TEXT NOT NULL,
  action TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  detail TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_audit_timestamp ON policy_audit (timestamp DESC);
`;

async function apply() {
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Schema applied successfully");
  }
}

apply();
