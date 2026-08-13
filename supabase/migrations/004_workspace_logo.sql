-- ============================================
-- KasKu — Database Migration 004
-- Workspace Logo
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- Dashboard > SQL Editor > New query > Paste > Run

-- ============================================
-- 1. Tambah kolom logo_url ke workspaces
-- ============================================
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;

-- ============================================
-- 2. Update VIEW workspace_stats
-- DROP dulu agar bisa tambah kolom baru (logo_url)
-- ============================================
DROP VIEW IF EXISTS public.workspace_stats;

CREATE VIEW public.workspace_stats AS
SELECT
  w.id,
  w.user_id,
  w.name,
  w.icon,
  w.color,
  w.description,
  w.is_archived,
  w.created_at,
  w.updated_at,
  COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS total_income,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
  COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE -t.amount END), 0) AS balance,
  COUNT(t.id) AS transaction_count,
  w.logo_url
FROM
  public.workspaces w
LEFT JOIN
  public.transactions t ON t.workspace_id = w.id
GROUP BY
  w.id;


-- ============================================
-- 3. Storage bucket: workspace-logos
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-logos', 'workspace-logos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. RLS Policies untuk bucket workspace-logos
-- ============================================

-- Upload: hanya pemilik workspace (folder = user_id)
CREATE POLICY "workspace_logos_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workspace-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Baca: semua orang bisa (public bucket, untuk PDF export)
CREATE POLICY "workspace_logos_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'workspace-logos');

-- Update: hanya pemilik
CREATE POLICY "workspace_logos_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'workspace-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Hapus: hanya pemilik
CREATE POLICY "workspace_logos_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'workspace-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
