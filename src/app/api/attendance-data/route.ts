import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Interface untuk attendance data
interface AttendanceRecord {
  session_id: number;
  status_kehadiran: string;
  attendance_sessions: {
    id: number;
    day_number: number;
    day_title: string;
    is_active: boolean;
    start_time: string | null;
    end_time: string | null;
  };
  user_email: string;
  full_name: string;
  jam: string | null;
  alasan: string | null;
  foto_url: string | null;
  waktu: string;
}

// Interface untuk session stats
interface SessionStats {
  [sessionId: string]: {
    session: AttendanceRecord['attendance_sessions'];
    total: number;
    hadir: number;
    tidakHadir: number;
    menyusul: number;
    meninggalkan: number;
  };
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

    // Ambil data presensi untuk session tertentu dengan join ke attendance_sessions
    const { data: attendance, error } = await supabase
      .from('absensi')
      .select(`
        *,
        attendance_sessions!inner(
          day_number,
          day_title
        )
      `)
      .eq('session_id', sessionId)
      .order('waktu', { ascending: true });

    if (error) {
      console.error('Error fetching attendance data:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data presensi' },
        { status: 500 }
      );
    }

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
      .from('absensi')
      .select(`
        *,
        attendance_sessions!inner(
          day_number,
          day_title,
          start_time,
          end_time
        )
      `)
      .order('waktu', { ascending: false });

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

    const { data: attendance, error } = await query;

    if (error) {
      console.error('Error fetching all attendance data:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data presensi' },
        { status: 500 }
      );
    }

    // Group by session untuk statistik
    const sessionStats = (attendance as AttendanceRecord[]).reduce((acc: SessionStats, record) => {
      const sessionId = record.session_id;
      if (!acc[sessionId]) {
        acc[sessionId] = {
          session: record.attendance_sessions,
          total: 0,
          hadir: 0,
          tidakHadir: 0,
          menyusul: 0,
          meninggalkan: 0
        };
      }
      
      acc[sessionId].total++;
      
      switch (record.status_kehadiran) {
        case 'Hadir':
          acc[sessionId].hadir++;
          break;
        case 'Tidak Hadir':
          acc[sessionId].tidakHadir++;
          break;
        case 'Menyusul':
          acc[sessionId].menyusul++;
          break;
        case 'Meninggalkan':
          acc[sessionId].meninggalkan++;
          break;
      }
      
      return acc;
    }, {});

    return NextResponse.json({ 
      attendance, 
      statistics: Object.values(sessionStats) 
    });

  } catch (error) {
    console.error('Error in POST /api/attendance-data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
