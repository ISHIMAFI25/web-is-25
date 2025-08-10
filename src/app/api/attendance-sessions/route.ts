import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Panggil function auto-close terlebih dahulu sebelum fetch data
    await supabase.rpc('trigger_auto_close');
    
    // Ambil semua sesi presensi, urutkan berdasarkan day_number
    const { data: sessions, error } = await supabase
      .from('attendance_sessions')
      .select('*')
      .order('day_number', { ascending: true });

    if (error) {
      console.error('Error fetching attendance sessions:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data sesi presensi' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in GET /api/attendance-sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, adminEmail } = await request.json();

    if (!sessionId || !adminEmail) {
      return NextResponse.json(
        { error: 'Session ID dan admin email diperlukan' },
        { status: 400 }
      );
    }

    if (action === 'activate') {
      // Nonaktifkan hanya sesi yang sedang aktif
      const { error: deactivateError } = await supabase
        .from('attendance_sessions')
        .update({ 
          is_active: false, 
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true)
        .neq('id', sessionId);

      if (deactivateError) {
        console.error('Error deactivating other sessions:', deactivateError);
        return NextResponse.json(
          { error: 'Gagal menonaktifkan sesi lain' },
          { status: 500 }
        );
      }

      // Aktifkan sesi yang dipilih
      const { data, error } = await supabase
        .from('attendance_sessions')
        .update({ 
          is_active: true, 
          start_time: new Date().toISOString(),
          end_time: null,
          created_by: adminEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('Error activating session:', error);
        return NextResponse.json(
          { error: 'Gagal mengaktifkan sesi presensi' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Sesi presensi berhasil diaktifkan',
        session: data
      });

    } else if (action === 'deactivate') {
      // Nonaktifkan sesi
      const { data, error } = await supabase
        .from('attendance_sessions')
        .update({ 
          is_active: false, 
          end_time: new Date().toISOString(),
          created_by: adminEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('Error deactivating session:', error);
        return NextResponse.json(
          { error: 'Gagal menonaktifkan sesi presensi' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Sesi presensi berhasil ditutup',
        session: data
      });

    } else {
      return NextResponse.json(
        { error: 'Action tidak valid' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in POST /api/attendance-sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API untuk membuat sesi presensi baru (khusus admin)
export async function PUT(request: NextRequest) {
  try {
    const { dayNumber, dayTitle, autoCloseTime, adminEmail } = await request.json();

    if (!dayNumber || !dayTitle || !adminEmail) {
      return NextResponse.json(
        { error: 'Day number, day title, dan admin email diperlukan' },
        { status: 400 }
      );
    }

    // Validasi auto close time jika ada
    if (autoCloseTime) {
      const autoCloseDate = new Date(autoCloseTime);
      const now = new Date();
      if (autoCloseDate <= now) {
        return NextResponse.json(
          { error: 'Waktu tutup otomatis harus di masa depan' },
          { status: 400 }
        );
      }
    }

    // Cek apakah day number sudah ada
    const { data: existingSession } = await supabase
      .from('attendance_sessions')
      .select('id')
      .eq('day_number', dayNumber)
      .single();

    if (existingSession) {
      return NextResponse.json(
        { error: `Sesi untuk Day ${dayNumber} sudah ada` },
        { status: 400 }
      );
    }

    // Buat sesi baru
    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert({
        day_number: dayNumber,
        day_title: dayTitle,
        is_active: false,
        auto_close_time: autoCloseTime || null,
        created_by: adminEmail
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating new session:', error);
      return NextResponse.json(
        { error: 'Gagal membuat sesi presensi baru' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Sesi presensi baru berhasil dibuat',
      session: data
    });

  } catch (error) {
    console.error('Error in PUT /api/attendance-sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
