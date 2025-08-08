# 📅 Dynamic Day Template System

## ✨ **Fitur Utama**

Sistem template dinamis untuk menampilkan informasi day yang dibuat admin di database. Template ini otomatis menampilkan:
- ✅ **Data dinamis dari database** - Mengambil informasi day sesuai nomor day
- ✅ **File attachments** - Support file lampiran dengan icon dan size 
- ✅ **Link attachments** - Support link lampiran external
- ✅ **Error handling** - Loading states, error states, dan not found states
- ✅ **Responsive design** - Style konsisten dengan homepage
- ✅ **Auto-scaling** - Otomatis menampilkan day baru yang dibuat admin

## 📁 **Struktur File**

```
src/
├── components/
│   └── DayTemplate.tsx           # Template komponen dinamis
├── app/informasi/
│   ├── day0/page.tsx            # Day 0 page menggunakan template
│   ├── day1/page.tsx            # Day 1 page menggunakan template  
│   ├── day2/page.tsx            # Day 2 page menggunakan template
│   └── dayX/page.tsx            # Day X page untuk masa depan
```

## 🚀 **Cara Menggunakan**

### 1. **Membuat Day Page Baru**

Untuk membuat halaman day baru (misalnya Day 3):

```bash
# Buat folder baru
mkdir src/app/informasi/day3

# Buat file page.tsx
```

```tsx
// src/app/informasi/day3/page.tsx
"use client";

import DayTemplate from "@/components/DayTemplate";

export default function Day3Page() {
  return <DayTemplate dayNumber={3} />;
}
```

### 2. **Template akan otomatis:**
- ✅ Mengambil data day nomor 3 dari database
- ✅ Menampilkan jika data ada
- ✅ Menampilkan pesan "Day 3 Belum Tersedia" jika belum dibuat admin
- ✅ Support file dan link attachments

### 3. **Admin Dashboard**
- Admin tinggal buat Day 3 di dashboard
- Data otomatis muncul di halaman day3
- Tidak perlu coding tambahan!

## 🔧 **Komponen Template**

### **DayTemplate Props:**
```tsx
interface DayPageProps {
  dayNumber: number;  // Nomor day yang ingin ditampilkan
}
```

### **Database Integration:**
- Mengambil data dari API: `/api/days`
- Filter berdasarkan `dayNumber`
- Support semua field database: title, description, dateTime, location, specifications, attachmentFiles, attachmentLinks

### **States yang Ditangani:**
1. **Loading State** - Saat mengambil data
2. **Error State** - Jika terjadi error API
3. **Not Found State** - Jika day belum dibuat admin
4. **Success State** - Menampilkan data lengkap

## 🎨 **Styling & Design**

Template menggunakan design yang sama dengan homepage:
- 🎨 **Parchment style** dengan efek gulungan ancient
- 🧭 **Compass decoration** di pojok kanan
- 📜 **Scroll decoration** di pojok kiri  
- 🎯 **Consistent color scheme** amber/brown
- 📱 **Responsive layout** untuk semua device

## 📊 **Data Display**

Template menampilkan:
- **Header**: Day X: [Title dari database]
- **Waktu**: Formatted tanggal Indonesia
- **Tempat**: Lokasi kegiatan
- **Deskripsi**: Penjelasan lengkap
- **Spesifikasi**: Persiapan yang diperlukan (optional)
- **File Lampiran**: Download links dengan icon
- **Link Lampiran**: External links
- **Call to Action**: Motivational message

## ⚡ **Performance**

- **Fast Loading**: Component ringan dengan lazy loading
- **Efficient API**: Single API call per page
- **Caching**: Browser cache untuk file static
- **Optimized**: Next.js 15 with Turbopack

## 🔧 **Maintenance**

### **Menambah Day Baru:**
1. Copy folder day template: `day1` → `dayX`
2. Update `dayNumber` prop di page component
3. Admin buat data di dashboard
4. Done! 🎉

### **Update Template:**
- Edit `src/components/DayTemplate.tsx`
- Semua day pages otomatis terupdate

## 🎯 **Keuntungan Sistem Ini**

1. **🚀 Scalable** - Mudah menambah day baru
2. **🔧 Maintainable** - Single source of truth untuk template
3. **📊 Consistent** - Design dan behavior sama di semua day
4. **⚡ Dynamic** - Data realtime dari database
5. **🛡️ Robust** - Error handling lengkap
6. **📱 Responsive** - Mobile-friendly
7. **🎨 Beautiful** - Design premium dengan theme ancient

## 📝 **Contoh Penggunaan**

```tsx
// Untuk Day 5
export default function Day5Page() {
  return <DayTemplate dayNumber={5} />;
}

// Untuk Day 10  
export default function Day10Page() {
  return <DayTemplate dayNumber={10} />;
}
```

## 🎉 **Result**

- ✅ **Template system berfungsi perfect**
- ✅ **Day0, Day1, Day2 sudah ready**
- ✅ **Sidebar navigation working**
- ✅ **Database integration complete**
- ✅ **Admin dashboard compatible**
- ✅ **File & link attachments supported**

**🎯 Admin tinggal buat day baru di dashboard, otomatis muncul di website!**
