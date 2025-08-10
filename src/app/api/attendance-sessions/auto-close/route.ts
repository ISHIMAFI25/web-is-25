import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// API untuk auto-close sesi yang sudah melewati waktu tutup otomatis
export async function POST(request: NextRequest) {
  try {
    // Gunakan database function v2 yang simple untuk auto-close
    const { data: result, error } = await supabase
      .rpc('auto_close_expired_sessions_v2');

    if (error) {
      console.error('Error calling auto_close_expired_sessions_v2:', error);
      return NextResponse.json(
        { error: 'Gagal menjalankan auto-close function' },
        { status: 500 }
      );
    }

    // Parse JSON result
    const autoCloseResult = result || { closed_count: 0, message: 'No sessions to close' };
    
    console.log(`Auto-close result:`, autoCloseResult);

    return NextResponse.json({
      message: autoCloseResult.message || `${autoCloseResult.closed_count || 0} sesi berhasil ditutup otomatis`,
      closedCount: autoCloseResult.closed_count || 0,
      totalProcessed: autoCloseResult.closed_count || 0,
      timestamp: autoCloseResult.timestamp
    });

  } catch (error) {
    console.error('Error in POST /api/attendance-sessions/auto-close:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API untuk mengecek sesi yang akan segera ditutup (dalam 5 menit)
export async function GET() {
  try {
    // Gunakan database function v2 untuk mendapatkan sesi yang akan segera ditutup
    const { data: result, error } = await supabase
      .rpc('get_upcoming_auto_close_sessions_v2');

    if (error) {
      console.error('Error calling get_upcoming_auto_close_sessions_v2:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data sesi yang akan ditutup' },
        { status: 500 }
      );
    }

    // Parse JSON result (array of upcoming sessions)
    const upcomingSessions = result || [];

    return NextResponse.json({
      upcomingSessions: upcomingSessions,
      count: Array.isArray(upcomingSessions) ? upcomingSessions.length : 0
    });

  } catch (error) {
    console.error('Error in GET /api/attendance-sessions/auto-close:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
