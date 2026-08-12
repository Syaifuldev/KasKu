-- ============================================
-- KasKu — Database Migration 003
-- Categories per Workspace
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- Dashboard > SQL Editor > New query > Paste > Run

-- ============================================
-- 1. TABLE: categories
-- Kategori transaksi per workspace (opsional)
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (workspace_id, name)
);

-- ============================================
-- 2. Tambah kolom category_id ke transactions
-- Nullable FK — transaksi lama tetap valid
-- ============================================
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS category_id UUID
  REFERENCES public.categories(id)
  ON DELETE SET NULL;

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_workspace_id ON public.categories(workspace_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 5. TRIGGER: auto-update updated_at
-- ============================================
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
