import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('Fetching submissions for user:', userEmail, 'limit:', limit);

    // Query untuk mengambil data submissions user dengan join ke attendance_sessions
    const { data: submissions, error } = await supabase
      .from('attendance_data')
      .select(`
        id,
        session_id,
        status_kehadiran,
        jam_menyusul_meninggalkan,
        alasan,
        foto_url,
        status_approval,
        feedback_admin,
        created_at,
        updated_at,
        attendance_sessions!inner (
          day_number,
          day_title
        )
      `)
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user submissions', details: error.message },
        { status: 500 }
      );
    }

    // Transform data untuk mempermudah akses
    const transformedSubmissions = submissions?.map(submission => {
      const sessionData = Array.isArray(submission.attendance_sessions) 
        ? submission.attendance_sessions[0] 
        : submission.attendance_sessions;
      
      return {
        id: submission.id,
        session_id: submission.session_id,
        day_number: sessionData?.day_number || 0,
        day_title: sessionData?.day_title || 'Unknown Day',
        status_kehadiran: submission.status_kehadiran,
        jam_menyusul_meninggalkan: submission.jam_menyusul_meninggalkan || null,
        alasan: submission.alasan,
        foto_url: submission.foto_url,
        status_approval: submission.status_approval,
        feedback_admin: submission.feedback_admin,
        created_at: submission.created_at || null,
        updated_at: submission.updated_at || null
      };
    }) || [];

    console.log('Found submissions:', transformedSubmissions.length);

    return NextResponse.json({
      success: true,
      submissions: transformedSubmissions,
      count: transformedSubmissions.length
    });

  } catch (error) {
    console.error('Error in user-submissions API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
