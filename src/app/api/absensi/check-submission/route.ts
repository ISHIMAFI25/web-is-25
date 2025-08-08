import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userEmail, sessionId } = await request.json();

    if (!userEmail || !sessionId) {
      return NextResponse.json(
        { error: 'User email dan session ID diperlukan' },
        { status: 400 }
      );
    }

    // Check if user already submitted for this session
    const { data, error } = await supabase
      .from('presensi_data')
      .select('id, status_approval, feedback_admin')
      .eq('user_email', userEmail)
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected if user hasn't submitted
      console.error('Error checking submission:', error);
      return NextResponse.json(
        { error: 'Gagal mengecek status submission' },
        { status: 500 }
      );
    }

    // If data exists, user has already submitted
    const hasSubmitted = !!data;

    return NextResponse.json({ 
      hasSubmitted,
      submissionData: data ? {
        id: data.id,
        status_approval: data.status_approval,
        feedback_admin: data.feedback_admin
      } : null
    });

  } catch (error) {
    console.error('Error in POST /api/absensi/check-submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
