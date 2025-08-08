import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API: Received data:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.status_kehadiran || !body.user_email || !body.session_id) {
      return NextResponse.json(
        { error: 'status_kehadiran, user_email, dan session_id diperlukan' },
        { status: 400 }
      );
    }
    
    // Check if session is active
    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('is_active')
      .eq('id', body.session_id)
      .single();
    
    if (sessionError || !session?.is_active) {
      return NextResponse.json(
        { error: 'Sesi presensi tidak aktif atau tidak ditemukan' },
        { status: 400 }
      );
    }
    
    // Check if user already submitted for this session
    const { data: existingSubmission } = await supabase
      .from('presensi_data')
      .select('id')
      .eq('user_email', body.user_email)
      .eq('session_id', body.session_id)
      .single();

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Anda sudah mengisi presensi untuk sesi ini' },
        { status: 400 }
      );
    }
    
    const insertData = {
      status_kehadiran: body.status_kehadiran,
      jam: body.jam || '',
      alasan: body.alasan || '',
      foto_url: body.foto_url || '',
      waktu_presensi: body.waktu || new Date().toISOString(),
      user_email: body.user_email,
      full_name: body.full_name || body.user_name || body.user_email,
      username: body.username || body.user_email,
      session_id: body.session_id
    };

    console.log('API: Inserting data to presensi_data:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('presensi_data')
      .insert([insertData])
      .select()
      .single();    if (error) {
      console.error('API: Supabase error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Anda sudah mengisi presensi untuk sesi ini' },
          { status: 400 }
        );
      }
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('API: Successfully saved to database:', JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Presensi berhasil disimpan',
      data: data,
      status_approval: data.status_approval,
      approval_message: data.status_kehadiran === 'Hadir' 
        ? 'Presensi Anda langsung disetujui'
        : 'Presensi Anda sedang menunggu persetujuan admin'
    });
  } catch (error) {
    console.error('API: Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server'
      },
      { status: 500 }
    );
  }
}
