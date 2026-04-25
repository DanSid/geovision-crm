-- ═══════════════════════════════════════════════════════════════════════════
-- Geovision CRM — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and click "Run".
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Auto-update updated_at on every change ────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── Helper: create one CRM table with id + data(JSONB) + timestamps ───────
-- We use a JSONB "data" column so the schema never needs changing when the
-- frontend data model evolves — new fields just land inside the JSON blob.

CREATE TABLE IF NOT EXISTS contacts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_all" ON contacts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS opportunities (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opportunities_all" ON opportunities FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS customers (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_all" ON customers FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS companies (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_all" ON companies FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS groups (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups_all" ON groups FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS activities (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_all" ON activities FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS notes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_all" ON notes FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER history_updated_at BEFORE UPDATE ON history
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history_all" ON history FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS documents (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_all" ON documents FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS secondary_contacts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER secondary_contacts_updated_at BEFORE UPDATE ON secondary_contacts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE secondary_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "secondary_contacts_all" ON secondary_contacts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS invoices (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_all" ON invoices FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS tasks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_all" ON tasks FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS boards (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boards_all" ON boards FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS equipment (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_all" ON equipment FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS stock_locations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER stock_locations_updated_at BEFORE UPDATE ON stock_locations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_locations_all" ON stock_locations FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS crew_members (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER crew_members_updated_at BEFORE UPDATE ON crew_members
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crew_members_all" ON crew_members FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS vehicles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_all" ON vehicles FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS maintenance (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER maintenance_updated_at BEFORE UPDATE ON maintenance
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_all" ON maintenance FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS requests (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       JSONB       NOT NULL    DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
CREATE TRIGGER requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests_all" ON requests FOR ALL USING (true) WITH CHECK (true);

-- ── Settings: one row per key (pipeline, permissions, etc.) ──────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL    DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_all" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Done! All 20 tables created.
-- Next: enable Realtime on each table in
--   Supabase Dashboard → Database → Replication → Realtime
-- Toggle ON for every table listed above.
-- ═══════════════════════════════════════════════════════════════════════════
