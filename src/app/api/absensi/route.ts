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
    if (!body.status_kehadiran || !body.user_email || !body.session_id || !body.day_id || !body.full_name || !body.username) {
      return NextResponse.json(
        { error: 'status_kehadiran, user_email, session_id, day_id, full_name, dan username diperlukan' },
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
    
    // Check if user already submitted for this session (untuk update jika ada)
    const { data: existingSubmission } = await supabase
      .from('attendance_data')
      .select('id')
      .eq('user_email', body.user_email)
      .eq('session_id', body.session_id)
      .single();
    
    // Prepare data for insert or update
    const attendanceData = {
      day_id: body.day_id,
      session_id: body.session_id,
      user_email: body.user_email,
      full_name: body.full_name,
      username: body.username,
      status_kehadiran: body.status_kehadiran,
      alasan: body.alasan || null,
      jam_menyusul_meninggalkan: body.jam_menyusul_meninggalkan || null,
      foto_url: body.foto_url || null
    };

    console.log('API: Preparing attendance data:', JSON.stringify(attendanceData, null, 2));

    let data, error;
    
    if (existingSubmission) {
      // Update existing submission (ganti status kehadiran)
      console.log('API: Updating existing submission with ID:', existingSubmission.id);
      
      const updateResult = await supabase
        .from('attendance_data')
        .update(attendanceData)
        .eq('id', existingSubmission.id)
        .select()
        .single();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new submission
      console.log('API: Inserting new attendance data');
      
      const insertResult = await supabase
        .from('attendance_data')
        .insert([attendanceData])
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error('API: Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('API: Successfully saved to database:', JSON.stringify(data, null, 2));
    
    // Determine response message
    const isUpdate = !!existingSubmission;
    const isApproved = data.status_approval === 'Disetujui';
    
    return NextResponse.json({ 
      success: true, 
      message: isUpdate ? 'Status kehadiran berhasil diperbarui' : 'Presensi berhasil disimpan',
      data: data,
      status_approval: data.status_approval,
      approval_message: isApproved 
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
