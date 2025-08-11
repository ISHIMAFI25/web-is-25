# User Submission Status Component - Documentation

## Overview
Komponen `UserSubmissionStatus` memberikan user kemampuan untuk melihat riwayat status presensi mereka meskipun sesi presensi sudah ditutup. Komponen ini terintegrasi di halaman absensi dan memberikan transparansi penuh kepada user tentang status persetujuan presensi mereka.

## Features

### 1. **Riwayat Status Presensi**
- Menampilkan semua submission presensi user
- Informasi detail untuk setiap submission:
  - Day number dan title
  - Status kehadiran (Hadir, Tidak Hadir, Menyusul, Meninggalkan)
  - Waktu presensi
  - Alasan (jika ada)
  - Status approval (Disetujui, Pending, Ditolak)
  - Feedback admin (jika ada)
  - Bukti foto (jika ada)

### 2. **Visual Status Indicators**
- **Badge system** dengan color coding:
  - 🟢 **Disetujui**: Green badge dengan checkmark
  - 🟡 **Pending**: Yellow badge dengan clock icon
  - 🔴 **Ditolak**: Red badge dengan X icon
- **Status kehadiran badges** dengan warna yang berbeda

### 3. **Integration Points**

#### A. Saat Tidak Ada Sesi Aktif
```tsx
// Ditampilkan ketika tidak ada sesi presensi yang aktif
// User masih bisa melihat riwayat status mereka
if (!activeSession) {
  return (
    <div>
      {/* Warning message */}
      <UserSubmissionStatus 
        userEmail={user.email} 
        showTitle={true}
        maxItems={10}
      />
    </div>
  );
}
```

#### B. Saat User Sudah Submit
```tsx
// Ditampilkan ketika user sudah submit untuk sesi aktif
// Menampilkan status submission + riwayat
if (alreadySubmitted) {
  return (
    <div>
      {/* Current submission status */}
      <UserSubmissionStatus 
        userEmail={user.email} 
        showTitle={true}
        maxItems={10}
      />
    </div>
  );
}
```

#### C. Saat Form Presensi Aktif
```tsx
// Ditampilkan di bawah form presensi yang aktif
// Memberikan konteks riwayat kepada user
<section className="w-full max-w-4xl mt-8">
  <UserSubmissionStatus 
    userEmail={user.email} 
    showTitle={true}
    maxItems={5}
  />
</section>
```

## API Endpoint

### `/api/attendance-data/user-submissions`
- **Method**: GET
- **Parameters**:
  - `userEmail`: Email user (required)
  - `limit`: Jumlah maksimal data (optional, default: 10)
- **Response**: Array of user submissions dengan detail lengkap

```typescript
interface UserSubmission {
  id: number;
  session_id: number;
  day_number: number;
  day_title: string;
  status_kehadiran: string;
  jam_presensi: string;
  alasan: string | null;
  foto_url: string | null;
  status_approval: 'Disetujui' | 'Pending' | 'Ditolak';
  feedback_admin: string | null;
  created_at: string;
  updated_at: string;
}
```

## Component Props

```typescript
interface UserSubmissionStatusProps {
  userEmail: string;          // Email user untuk fetch data
  showTitle?: boolean;        // Tampilkan title komponen (default: true)
  maxItems?: number;          // Maksimal item yang ditampilkan (default: 5)
}
```

## Benefits

### For Users:
1. **Transparansi Penuh**: User dapat melihat status approval mereka kapan saja
2. **Riwayat Lengkap**: Akses ke semua submission historis
3. **Status Real-time**: Informasi terkini tentang persetujuan admin
4. **Feedback Visibility**: User dapat melihat feedback dari admin

### For System:
1. **Reduced Admin Load**: User tidak perlu menanya status ke admin
2. **Better UX**: User tetap bisa akses informasi meski sesi ditutup
3. **Audit Trail**: Record lengkap semua aktivitas presensi

## Technical Implementation

### Database Query
```sql
SELECT 
  ad.*,
  as.day_number,
  as.day_title
FROM attendance_data ad
JOIN attendance_sessions as ON ad.session_id = as.id
WHERE ad.user_email = $1
ORDER BY ad.created_at DESC
LIMIT $2
```

### Error Handling
- Loading states dengan spinner
- Error messages yang user-friendly
- Graceful fallback untuk data kosong

### Performance
- Pagination dengan limit parameter
- Efficient database queries dengan proper indexing
- Client-side caching untuk mengurangi API calls

## Future Enhancements
1. **Export functionality**: Export riwayat ke PDF/Excel
2. **Filter options**: Filter berdasarkan status, tanggal, dll
3. **Notification**: Real-time updates saat status berubah
4. **Statistics**: Summary statistik presensi user
