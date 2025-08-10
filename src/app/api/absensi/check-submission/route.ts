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

    // Use the database function to check submission
    const { data, error } = await supabase
      .rpc('check_user_submission', {
        p_user_email: userEmail,
        p_session_id: sessionId
      });

    if (error) {
      console.error('Error checking submission:', error);
      return NextResponse.json(
        { error: 'Gagal mengecek status submission' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in POST /api/absensi/check-submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
