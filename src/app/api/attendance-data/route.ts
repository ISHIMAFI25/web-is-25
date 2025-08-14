import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Interface untuk attendance data
// Catatan: Tabel yang benar untuk data presensi terperinci adalah 'attendance_data'.
// Kode awal salah menggunakan tabel 'absensi'. Kita sesuaikan tipe dan mapping di bawah.

interface RawAttendanceData {
  id: number;
  session_id: number;
  user_email: string;
  full_name: string;
  username: string;
  status_kehadiran: string;
  alasan: string | null;
  jam_menyusul_meninggalkan: string | null;
  foto_url: string | null;
  created_at: string;
  attendance_sessions: {
    day_number: number;
    day_title: string;
  };
}

interface TransformedAttendanceRecord {
  id: number;
  status_kehadiran: string;
  jam: string | null;
  alasan: string | null;
  foto_url: string | null;
  waktu: string; // mapped from created_at
  user_email: string;
  user_name: string; // alias full_name
  full_name: string;
  username: string;
  session_id: number;
  attendance_sessions?: {
    day_number: number;
    day_title: string;
  };
}

interface SessionStatsItem {
  session: { day_number: number; day_title: string };
  total: number;
  hadir: number;
  tidakHadir: number;
  menyusul: number;
  meninggalkan: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID diperlukan' },
        { status: 400 }
      );
    }

    // Ambil data presensi dari attendance_data (bukan absensi) + join attendance_sessions
    const { data, error } = await supabase
      .from('attendance_data')
      .select(`
        id,
        session_id,
        user_email,
        full_name,
        username,
        status_kehadiran,
        alasan,
        jam_menyusul_meninggalkan,
        foto_url,
        created_at,
        attendance_sessions!inner(
          day_number,
          day_title
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching attendance data (attendance_data):', error, {
        sessionId,
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        message: (error as any)?.message,
      });
      return NextResponse.json(
        { error: 'Gagal mengambil data presensi' },
        { status: 500 }
      );
    }

  const attendance: TransformedAttendanceRecord[] = (data as unknown as RawAttendanceData[]).map(r => ({
      id: r.id,
      status_kehadiran: r.status_kehadiran,
      jam: r.jam_menyusul_meninggalkan,
      alasan: r.alasan,
      foto_url: r.foto_url,
      waktu: r.created_at,
      user_email: r.user_email,
      user_name: r.full_name,
      full_name: r.full_name,
      username: r.username,
      session_id: r.session_id,
      attendance_sessions: r.attendance_sessions
    }));

    return NextResponse.json({ attendance });

  } catch (error) {
    console.error('Error in GET /api/attendance-data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API untuk mendapatkan semua data presensi (untuk admin)
export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, sessionIds } = await request.json();

    let query = supabase
      .from('attendance_data')
      .select(`
        id,
        session_id,
        user_email,
        full_name,
        username,
        status_kehadiran,
        alasan,
        jam_menyusul_meninggalkan,
        foto_url,
        created_at,
        attendance_sessions!inner(
          day_number,
          day_title
        )
      `)
      .order('created_at', { ascending: false });

    // Filter berdasarkan tanggal jika disediakan
    if (startDate) {
      query = query.gte('waktu', startDate);
    }
    if (endDate) {
      query = query.lte('waktu', endDate);
    }

    // Filter berdasarkan session IDs jika disediakan
    if (sessionIds && sessionIds.length > 0) {
      query = query.in('session_id', sessionIds);
    }

  const { data, error } = await query;

    if (error) {
      console.error('Error fetching all attendance data (attendance_data):', error, {
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        message: (error as any)?.message,
        filters: { startDate, endDate, sessionIds }
      });
      return NextResponse.json(
        { error: 'Gagal mengambil data presensi' },
        { status: 500 }
      );
    }

  const transformed: TransformedAttendanceRecord[] = (data as unknown as RawAttendanceData[]).map(r => ({
      id: r.id,
      status_kehadiran: r.status_kehadiran,
      jam: r.jam_menyusul_meninggalkan,
      alasan: r.alasan,
      foto_url: r.foto_url,
      waktu: r.created_at,
      user_email: r.user_email,
      user_name: r.full_name,
      full_name: r.full_name,
      username: r.username,
      session_id: r.session_id,
      attendance_sessions: r.attendance_sessions
    }));

    // Group by session untuk statistik
    const statsMap = new Map<number, SessionStatsItem>();
    for (const rec of transformed) {
      if (!statsMap.has(rec.session_id)) {
        statsMap.set(rec.session_id, {
          session: rec.attendance_sessions || { day_number: 0, day_title: '' },
          total: 0, hadir: 0, tidakHadir: 0, menyusul: 0, meninggalkan: 0
        });
      }
      const bucket = statsMap.get(rec.session_id)!;
      bucket.total++;
      switch (rec.status_kehadiran) {
        case 'Hadir': bucket.hadir++; break;
        case 'Tidak Hadir': bucket.tidakHadir++; break;
        case 'Menyusul': bucket.menyusul++; break;
        case 'Meninggalkan': bucket.meninggalkan++; break;
      }
    }

    return NextResponse.json({ 
      attendance: transformed,
      statistics: Array.from(statsMap.values())
    });

  } catch (error) {
    console.error('Error in POST /api/attendance-data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
