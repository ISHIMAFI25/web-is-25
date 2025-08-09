// src/app/api/check-submission/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { studentEmail, taskId } = await request.json();

    if (!studentEmail || !taskId) {
      return NextResponse.json(
        { error: 'Student email and task ID are required' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const { data, error } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('student_email', studentEmail)
      .eq('task_id', taskId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if no submission exists
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (data) {
      return NextResponse.json({
        exists: true,
        submission: {
          id: data.id,
          submission_file_url: data.submission_file_url,
          submission_file_name: data.submission_file_name,
          submission_file_type: data.submission_file_type,
          submitted_at: data.submitted_at,
          is_submitted: data.is_submitted || false,
        },
      });
    } else {
      return NextResponse.json({
        exists: false,
      });
    }
  } catch (error) {
    console.error('Error checking submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
