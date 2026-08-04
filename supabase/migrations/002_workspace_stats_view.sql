-- Buat view untuk menghitung statistik per workspace
-- Menggunakan view akan lebih optimal daripada menarik semua transaksi ke client

CREATE OR REPLACE VIEW workspace_stats AS
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
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as balance,
  COUNT(t.id) as transaction_count
FROM 
  workspaces w
LEFT JOIN 
  transactions t ON t.workspace_id = w.id
GROUP BY 
  w.id;
