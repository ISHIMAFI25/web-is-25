# Day Management System Documentation

## Overview

Sistem Day Management adalah fitur komprehensif untuk mengelola informasi hari-hari dalam program pembelajaran. Sistem ini memungkinkan admin untuk membuat, mengedit, dan mengelola informasi day dengan kontrol visibilitas untuk peserta.

## Features

### Admin Features
- ✅ **Create Day**: Membuat informasi day baru dengan form lengkap
- ✅ **Edit Day**: Mengubah informasi day yang sudah ada
- ✅ **Delete Day**: Menghapus day yang tidak diperlukan
- ✅ **File Attachments**: Upload file lampiran untuk setiap day
- ✅ **Visibility Control**: Mengatur apakah day dapat dilihat peserta atau tidak
- ✅ **Real-time Updates**: Perubahan langsung ter-refresh di interface

### Participant Features
- ✅ **View Days**: Melihat daftar day yang sudah di-publish admin
- ✅ **Upcoming Day Info**: Homepage menampilkan day terdekat yang akan datang
- ✅ **Sidebar Navigation**: Navigasi mudah ke semua day yang tersedia
- ✅ **File Downloads**: Download file lampiran dari setiap day

## Database Schema

### Days Table Structure

```sql
CREATE TABLE days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_number INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date_time TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    specifications TEXT,
    attachment_files JSONB DEFAULT '[]'::jsonb,
    is_visible BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `day_number` | INTEGER | Nomor day (1, 2, 3, dst) - harus unik |
| `title` | TEXT | Judul day (required) |
| `description` | TEXT | Deskripsi lengkap day (required) |
| `date_time` | TIMESTAMPTZ | Tanggal dan waktu pelaksanaan (required) |
| `location` | TEXT | Lokasi berkumpul (required) |
| `specifications` | TEXT | Spesifikasi tambahan (optional) |
| `attachment_files` | JSONB | Array file lampiran dalam format: `[{"name": "file.pdf", "url": "https://..."}]` |
| `is_visible` | BOOLEAN | Kontrol visibilitas untuk peserta (default: false) |
| `created_at` | TIMESTAMPTZ | Timestamp pembuatan |
| `updated_at` | TIMESTAMPTZ | Timestamp update terakhir |

## API Endpoints

### Admin Endpoints

#### GET /api/admin/days
Mendapatkan semua day (termasuk yang hidden)
- **Auth**: Requires admin
- **Response**: `{ days: Day[] }`

#### POST /api/admin/days
Membuat day baru
- **Auth**: Requires admin
- **Body**: Day creation data
- **Response**: `{ day: Day }`

#### PUT /api/admin/days/[id]
Update day yang sudah ada
- **Auth**: Requires admin
- **Body**: Day update data
- **Response**: `{ day: Day }`

#### DELETE /api/admin/days/[id]
Menghapus day
- **Auth**: Requires admin
- **Response**: `{ success: true }`

### Public Endpoints

#### GET /api/days
Mendapatkan semua day yang visible untuk peserta
- **Auth**: Requires authentication
- **Response**: `{ days: Day[] }`

#### GET /api/days/upcoming
Mendapatkan day terdekat yang akan datang
- **Auth**: Requires authentication
- **Response**: `{ day: Day | null }`

## Components

### DayManager (Admin)
Komponen admin untuk mengelola day dengan fitur:
- Form creation/editing dengan validasi
- File upload dengan drag & drop
- Visibility toggle
- Real-time data fetching
- Delete confirmation

**Path**: `src/components/admin/DayManager.tsx`

### UpcomingDayInfo (Homepage)
Komponen yang menampilkan informasi day terdekat di homepage:
- Auto-fetch day terdekat
- Responsive design
- File download links
- Status indicators

**Path**: `src/components/UpcomingDayInfo.tsx`

### DaysSidebar (Navigation)
Komponen sidebar untuk navigasi day:
- List semua day yang tersedia
- Status indicators (upcoming, past)
- Admin visibility indicators
- Quick navigation

**Path**: `src/components/DaysSidebar.tsx`

## File Upload System

### Supported File Types
Sistem mendukung semua jenis file dengan icon otomatis:
- 📄 Documents: PDF
- 📝 Text: DOC, DOCX
- 📊 Presentations: PPT, PPTX
- 📈 Spreadsheets: XLS, XLSX
- 🖼️ Images: JPG, PNG, GIF, etc.
- 📦 Archives: ZIP, RAR, 7Z
- 🎥 Videos: MP4, AVI, MOV
- 🎵 Audio: MP3, WAV, OGG
- 💻 Code: JS, TS, HTML, CSS
- ⚙️ Programming: PY, JAVA, CPP
- 📃 Text: TXT, MD
- 📎 Others: Default clip icon

### Upload Process
1. User selects/drags files
2. Files uploaded to storage service
3. URLs stored in JSONB array format:
   ```json
   [
     {"name": "panduan-day1.pdf", "url": "https://storage.url/file1.pdf"},
     {"name": "materi.pptx", "url": "https://storage.url/file2.pptx"}
   ]
   ```

## Security

### Row Level Security (RLS)
Database menggunakan RLS policies:

```sql
-- Admin can do everything
CREATE POLICY "Admins can manage all days" ON days
    FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Users can only read visible days
CREATE POLICY "Users can read visible days" ON days
    FOR SELECT USING (is_visible = true);
```

### Authentication
- All endpoints require valid JWT token
- Admin endpoints check for admin role
- File uploads protected by authentication

## Deployment

### Database Setup
1. Run migration script:
   ```bash
   # Linux/Mac
   ./scripts/deploy-days-table.sh
   
   # Windows
   ./scripts/deploy-days-table.bat
   ```

2. Verify table creation in Supabase dashboard

### Environment Variables
Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Usage Examples

### Creating a Day (Admin)
1. Go to Admin Panel → Manajemen Day tab
2. Click "Tambah Day Baru"
3. Fill required fields:
   - Day Number: 1
   - Title: "Orientation Day"
   - Description: "Pengenalan program dan materi dasar"
   - Date & Time: Select date and time
   - Location: "Ruang Auditorium"
   - Specifications: "Bawa laptop dan charger"
4. Upload files (optional)
5. Set visibility (default: hidden)
6. Click "Buat Day"

### Making Day Visible
1. In admin panel, find the day
2. Click edit button
3. Toggle "Terlihat untuk peserta" to ON
4. Save changes

### Viewing Days (Participant)
1. Day information appears in sidebar automatically
2. Upcoming day shows on homepage
3. Click any day in sidebar to view details
4. Download attached files if available

## Troubleshooting

### Common Issues

#### 1. Day not showing on homepage
- Check if day is set to visible (`is_visible = true`)
- Verify day date is in the future
- Check API endpoint `/api/days/upcoming`

#### 2. File upload not working
- Verify upload service configuration
- Check file size limits
- Ensure proper authentication

#### 3. Admin can't see day management
- Verify admin role in database
- Check authentication status
- Ensure admin access permissions

#### 4. Database connection issues
- Verify environment variables
- Check Supabase URL and keys
- Run deployment script again

### Debug API Calls
Use browser dev tools to check:
1. Network tab for API responses
2. Console for JavaScript errors
3. Application tab for local storage/tokens

## Future Enhancements

### Planned Features
- [ ] **Day Templates**: Reusable day templates
- [ ] **Bulk Operations**: Manage multiple days at once
- [ ] **Day Categories**: Group days by type/theme
- [ ] **Notification System**: Alert participants about new days
- [ ] **Comment System**: Allow participant feedback
- [ ] **Calendar View**: Visual calendar for day scheduling
- [ ] **Attendance Tracking**: Track day attendance
- [ ] **Export Features**: Export day information to PDF/Excel

### Technical Improvements
- [ ] **Caching**: Implement data caching for better performance
- [ ] **Search**: Full-text search across day content
- [ ] **Filtering**: Advanced filtering options
- [ ] **Pagination**: Handle large datasets efficiently
- [ ] **Real-time Updates**: WebSocket for live updates
- [ ] **Image Optimization**: Automatic image compression
- [ ] **Progressive Loading**: Load content progressively

## Support

For issues or questions about the Day Management System:
1. Check this documentation first
2. Review API endpoint responses
3. Check browser console for errors
4. Verify database table structure
5. Ensure proper authentication and permissions

The system is designed to be intuitive and user-friendly while providing comprehensive day management capabilities for educational programs.
