# 🗄️ Mengatasi Error: Tabel 'days' Tidak Ditemukan

## ❌ **Masalah yang Terjadi**
```
Database error: {
  code: 'PGRST205',
  details: null,
  hint: null,
  message: "Could not find the table 'public.days' in the schema cache"
}
```

## 🎯 **Penyebab**
Tabel `days` telah dihapus dari Supabase database, sehingga API `/api/days` tidak dapat mengakses data.

## ✅ **Solusi Lengkap**

### **Langkah 1: Buat Tabel di Supabase**
1. Buka **Supabase Dashboard** Anda
2. Masuk ke **SQL Editor**
3. Copy dan paste script berikut:

```sql
-- Copy semua isi dari file: database/create_days_table.sql
```

4. **Execute** script tersebut

### **Langkah 2: Verifikasi Setup**
Jalankan script test:
```bash
scripts\setup-days-table.bat
```

## 🏗️ **Struktur Tabel Days**

```sql
CREATE TABLE public.days (
  id VARCHAR(255) PRIMARY KEY,
  day_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  date_time TIMESTAMPTZ,
  location TEXT,
  specifications TEXT,
  attachment_files JSONB DEFAULT '[]',
  attachment_links JSONB DEFAULT '[]',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Penjelasan Kolom:**
- **`id`** - Primary key (UUID)
- **`day_number`** - Nomor hari (unik, integer)
- **`title`** - Judul hari (contoh: "Day 1 - Introduction")
- **`description`** - Deskripsi kegiatan
- **`date_time`** - Tanggal dan waktu kegiatan
- **`location`** - Lokasi kegiatan
- **`specifications`** - Spesifikasi atau persyaratan
- **`attachment_files`** - Array file lampiran (JSON)
- **`attachment_links`** - Array link lampiran (JSON)
- **`is_visible`** - Apakah hari ini ditampilkan ke public
- **`created_at/updated_at`** - Timestamp otomatis

## 📊 **Data Sample yang Ditambahkan**

Script akan menambahkan data sample:
- **Day 0** - Orientation
- **Day 1** - Introduction to Web Development
- **Day 2** - Frontend Frameworks  
- **Day 3** - Backend Development (tidak visible)

## 🔒 **Keamanan (RLS Policies)**

### **Policy untuk Public:**
- Hanya bisa melihat days dengan `is_visible = true`

### **Policy untuk Admin:**
- Bisa mengelola semua data days (CRUD operations)

## 🛠️ **File yang Dibuat/Diperbarui**

1. **`database/create_days_table.sql`** - Script SQL untuk membuat tabel
2. **`scripts/setup-days-table.bat`** - Script test dan setup
3. **`src/lib/db/schema.ts`** - Menambah definisi tabel days
4. **Dokumentasi ini** - Panduan troubleshooting

## 🚀 **Setelah Setup Berhasil**

### **Yang Akan Berfungsi:**
- ✅ API `/api/days` akan return data days
- ✅ Halaman yang menggunakan informasi days akan normal
- ✅ Admin dapat mengelola visibility days
- ✅ Attachment files dan links dapat disimpan

### **Cara Test Manual:**
```javascript
// Di browser console
fetch('/api/days')
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "days": [
    {
      "id": "...",
      "day_number": 0,
      "title": "Day 0 - Orientation",
      "description": "...",
      "is_visible": true,
      // ... fields lainnya
    }
  ]
}
```

## 🔧 **Troubleshooting**

### **Jika masih error PGRST205:**
1. Pastikan script SQL sudah dijalankan dengan benar
2. Refresh schema cache di Supabase (restart project)
3. Periksa permissions tabel

### **Jika RLS error:**
1. Pastikan user memiliki role yang sesuai
2. Test disable RLS sementara untuk debugging:
   ```sql
   ALTER TABLE days DISABLE ROW LEVEL SECURITY;
   ```

### **Jika data tidak muncul:**
1. Periksa `is_visible = true` pada data
2. Cek order by `day_number`
3. Pastikan data sample sudah ter-insert

---

## ✅ **Status: SIAP DIJALANKAN**

Semua file dan script sudah siap. Tinggal execute SQL script di Supabase untuk mengatasi error tabel days yang hilang! 🎉
