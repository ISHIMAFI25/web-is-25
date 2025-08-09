# 🗄️ Mengatasi Error: Column 'submission_status' Tidak Ditemukan

## ❌ **Error yang Terjadi**
```
Database error: {
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'submission_status' column of 'task_submissions' in the schema cache"
}
```

## 🎯 **Penyebab**
Tabel `task_submissions` tidak memiliki kolom `submission_status` atau struktur tabel tidak lengkap/rusak.

## ✅ **Solusi: Buat Tabel Baru**

### **Langkah 1: Backup Data (Jika Perlu)**
Jika ada data penting di tabel lama:
```sql
-- Backup existing data
CREATE TABLE task_submissions_backup AS SELECT * FROM task_submissions;
```

### **Langkah 2: Buat Tabel Baru**
1. Buka **Supabase Dashboard** 
2. Masuk ke **SQL Editor**
3. Copy dan paste script berikut:

```sql
-- Copy semua isi dari file: database/create_task_submissions_table.sql
```

4. **Execute** script tersebut

### **Langkah 3: Verifikasi**
Jalankan script test:
```bash
scripts\setup-task-submissions-table.bat
```

## 🏗️ **Struktur Tabel Baru**

```sql
CREATE TABLE task_submissions (
  id BIGSERIAL PRIMARY KEY,
  student_email VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  task_id VARCHAR(255) NOT NULL,
  task_day INTEGER NOT NULL,
  submission_type VARCHAR(50) CHECK (submission_type IN ('file', 'link')),
  submission_file_url TEXT,
  submission_file_name TEXT,
  submission_file_type TEXT,
  submission_link TEXT,
  submission_status VARCHAR(50) DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted')),
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_email, task_id) -- One submission per student per task
);
```

### **Penjelasan Kolom:**

#### **Identitas & Task Info:**
- **`id`** - Primary key auto-increment
- **`student_email`** - Email mahasiswa (NOT NULL)
- **`student_name`** - Nama mahasiswa (NOT NULL)
- **`task_id`** - ID tugas yang dikerjakan (NOT NULL)
- **`task_day`** - Hari ke-berapa tugas ini (NOT NULL)

#### **Submission Data:**
- **`submission_type`** - Jenis submission: 'file' atau 'link'
- **`submission_file_url`** - URL file jika submit file
- **`submission_file_name`** - Nama file yang diupload
- **`submission_file_type`** - Tipe file (pdf, docx, etc.)
- **`submission_link`** - URL link jika submit link (GitHub, etc.)

#### **Status & Tracking:**
- **`submission_status`** - Status: 'draft' atau 'submitted'
- **`is_submitted`** - Boolean flag apakah sudah disubmit
- **`submitted_at`** - Timestamp ketika disubmit
- **`created_at/updated_at`** - Timestamp otomatis

## 🔒 **Keamanan (RLS Policies)**

### **Untuk Mahasiswa:**
- ✅ Hanya bisa lihat submission sendiri
- ✅ Hanya bisa insert/update submission sendiri
- ✅ Tidak bisa lihat submission mahasiswa lain

### **Untuk Admin:**
- ✅ Bisa lihat semua submissions
- ✅ Bisa mengelola semua submissions

## ⚡ **Fitur & Optimasi**

### **Indexes untuk Performa:**
- `student_email` - Cari by mahasiswa
- `task_id` - Cari by tugas
- `(student_email, task_id)` - Kombinasi unik
- `task_day` - Filter by hari
- `submission_status` - Filter by status
- `is_submitted` - Filter yang sudah submit

### **Constraint & Validasi:**
- **Unique constraint** - Satu mahasiswa hanya bisa submit satu kali per tugas
- **Check constraint** - submission_type hanya 'file' atau 'link'
- **Check constraint** - submission_status hanya 'draft' atau 'submitted'

### **Auto Triggers:**
- **updated_at** - Otomatis update timestamp saat data berubah

## 🛠️ **File yang Dibuat/Diperbarui**

1. **`database/create_task_submissions_table.sql`** - Script SQL lengkap
2. **`scripts/setup-task-submissions-table.bat`** - Script test dan setup
3. **`src/lib/db/schema.ts`** - Ditambah definisi tabel task_submissions
4. **Dokumentasi ini** - Panduan troubleshooting

## 🚀 **Setelah Setup Berhasil**

### **Yang Akan Berfungsi:**
- ✅ Submit tugas (file atau link) 
- ✅ Save draft sebelum submit final
- ✅ Check status submission
- ✅ Unsubmit tugas (kembali ke draft)
- ✅ Admin bisa lihat semua submissions

### **API Endpoints yang Akan Normal:**
- `POST /api/submit-task` - Submit tugas
- `POST /api/save-draft` - Save draft
- `GET /api/check-submission` - Cek status
- `POST /api/unsubmit-task` - Batalkan submit

### **Cara Test Manual:**
```javascript
// Test submit tugas via browser console
fetch('/api/submit-task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentEmail: 'your-email@example.com',
    studentName: 'Your Name',
    taskId: 'task-1-test',
    taskDay: 1,
    submissionType: 'link',
    submissionLink: 'https://github.com/yourrepo'
  })
})
.then(r => r.json())
.then(console.log)
```

## 🔧 **Troubleshooting**

### **❌ Error: "new row violates row-level security policy"**

**Penyebab:** RLS policy terlalu ketat atau ada masalah authentication.

**Solusi Cepat (Development):**
```bash
# Jalankan quick fix script
scripts\fix-rls-error.bat
```

**Solusi Manual:**
```sql
-- Disable RLS sementara untuk development
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;
```

### **❌ Error: "violates check constraint submission_type_check"**

**Penyebab:** Aplikasi mengirim value `'both'` untuk submission_type, tapi constraint hanya allow `'file'` atau `'link'`.

**Solusi:**
```sql
-- Update constraint untuk allow 'both'
ALTER TABLE task_submissions DROP CONSTRAINT IF EXISTS task_submissions_submission_type_check;
ALTER TABLE task_submissions ADD CONSTRAINT task_submissions_submission_type_check 
    CHECK (submission_type IN ('file', 'link', 'both'));
```

**Fix Komprehensif:**
```sql
-- Copy dan paste dari: database/fix_all_task_submissions_issues.sql
```

### **Jika masih error PGRST204:**
1. Pastikan script SQL sudah dijalankan dengan benar
2. Refresh schema cache di Supabase
3. Restart development server

### **Jika unique constraint error:**
- Normal behavior - satu mahasiswa hanya bisa submit sekali per tugas
- Gunakan UPDATE untuk mengubah submission yang ada

### **Debug Authentication:**
```sql
-- Cek current user di Supabase
SELECT auth.role(), auth.jwt() ->> 'email';
```

---

## ✅ **Status: SIAP DIJALANKAN**

Tabel `task_submissions` yang baru sudah siap dengan struktur lengkap, keamanan RLS, dan optimasi performa. Tinggal execute SQL script di Supabase! 🎉

## 📊 **Sample Data**

Script akan menambahkan data sample untuk testing:
- Student test dengan link submission (submitted)
- Student test dengan draft submission (belum submit)

Anda bisa menghapus sample data setelah testing jika tidak diperlukan.
