# CARA ADMIN APPROVE PRESENSI - MANUAL EDIT

## Overview 📋
Admin menyetujui/menolak presensi dengan mengedit langsung tabel di Supabase Dashboard. Tidak perlu interface khusus.

## Langkah-langkah Approval ✅

### 1. Buka Supabase Dashboard
- Login ke [Supabase Dashboard](https://app.supabase.com)
- Pilih project Anda
- Masuk ke **Table Editor**

### 2. Pilih Tabel/View
**Opsi A - Tabel Utama:**
- Buka tabel `presensi_data`
- Filter `status_approval = 'Pending'` untuk lihat yang perlu approval

**Opsi B - View Khusus Admin (RECOMMENDED):**
- Buka view `presensi_untuk_admin`
- Sudah difilter untuk yang butuh approval
- Kolom sudah diberi nama yang jelas

### 3. Edit Status Approval
- Klik pada kolom **Status Approval (EDIT INI)**
- Ubah dari `Pending` menjadi:
  - `Disetujui` - untuk menyetujui
  - `Ditolak` - untuk menolak

### 4. Tambah Feedback (Opsional)
- Edit kolom **Feedback Admin (EDIT INI)**
- Berikan keterangan untuk user
- Contoh: "Alasan valid", "Foto tidak jelas", "Perlu konfirmasi ulang"

### 5. Otomatis Update
- Sistem otomatis set `approved_at` ke waktu sekarang
- `approved_by` otomatis set ke "admin_manual"

## Jenis Status Kehadiran 📊

### Auto-Approved ✅
- **Hadir**: Langsung disetujui otomatis oleh sistem

### Perlu Manual Approval ⏳
- **Tidak Hadir**: Butuh review admin
- **Menyusul**: Butuh review waktu dan alasan
- **Meninggalkan**: Butuh review waktu dan alasan

## Contoh Workflow 🔄

1. **User submit presensi "Menyusul"**
   - Status otomatis: `Pending`
   - Masuk ke queue approval

2. **Admin buka view `presensi_untuk_admin`**
   - Lihat data: Nama, Username, Alasan, Foto
   - Cek validitas alasan dan bukti

3. **Admin edit status:**
   - Ubah `Status Approval (EDIT INI)` → `Disetujui`
   - Isi `Feedback Admin (EDIT INI)` → "Alasan valid"

4. **User dapat notifikasi status**
   - Sistem update approval status
   - User lihat feedback dari admin

## Tips untuk Admin 💡

### Validasi yang Perlu Dicek:
- **Alasan masuk akal**: Cek logika alasan ketidakhadiran
- **Foto bukti valid**: Pastikan foto mendukung alasan
- **Waktu sesuai**: Untuk menyusul/meninggalkan, cek waktu masuk akal
- **Konsistensi**: Pastikan tidak ada duplikasi atau konflik

### Feedback yang Baik:
- **Disetujui**: "Alasan valid", "Bukti foto jelas", "Waktu sesuai"
- **Ditolak**: "Alasan kurang jelas", "Foto tidak mendukung", "Waktu tidak masuk akal"

## Monitoring & Reports 📈

### View untuk Admin:
- `presensi_untuk_admin`: Fokus pada yang butuh approval
- `presensi_lengkap`: Data lengkap dengan info sesi
- `admin_approval_queue`: Hanya yang status pending

### Statistik Approval:
- Pending: Berapa yang menunggu approval
- Disetujui: Total yang sudah disetujui
- Ditolak: Total yang ditolak
- Auto-approved: Status "Hadir" otomatis

## Troubleshooting 🔧

### Jika tidak bisa edit:
1. Pastikan login sebagai admin di Supabase
2. Cek RLS policies sudah benar
3. Refresh halaman Table Editor

### Jika status tidak update:
1. Cek trigger `update_approval_timestamp_trigger` aktif
2. Pastikan edit di kolom yang benar
3. Reload data di aplikasi

### Jika user tidak dapat notifikasi:
1. Cek API response format
2. Pastikan frontend polling/refresh data
3. Cek state management di user interface

## Best Practices ⭐

1. **Review Regular**: Cek approval queue setiap hari
2. **Feedback Konsisten**: Berikan feedback yang membantu user
3. **Dokumentasi**: Catat pattern approval untuk referensi
4. **Komunikasi**: Koordinasi dengan admin lain jika ada

## Security Notes 🔒

- Hanya admin yang punya akses edit tabel
- Log otomatis untuk audit trail
- Timestamp approval tercatat otomatis
- User tidak bisa ubah status sendiri

---

**Hasil:** Sistem approval sederhana tanpa kompleksitas interface, langsung edit di database dengan kontrol penuh admin.
