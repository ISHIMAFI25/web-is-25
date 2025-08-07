// src/app/api/save-draft/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const {
      studentEmail,
      studentName,
      taskId,
      taskDay,
      submissionFileUrl,
      submissionFileName,
      submissionFileType,
    } = await request.json();

    if (!studentEmail || !studentName || !taskId || taskDay === undefined || taskDay === null || !submissionFileUrl || !submissionFileName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if submission already exists
    const { data: existingSubmission } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('student_email', studentEmail)
      .eq('task_id', taskId)
      .single();

    let data, error;

    if (existingSubmission) {
      // Update existing submission as draft
      ({ data, error } = await supabase
        .from('task_submissions')
        .update({
          submission_file_url: submissionFileUrl,
          submission_file_name: submissionFileName,
          submission_file_type: submissionFileType,
          is_submitted: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubmission.id)
        .select()
        .single());
    } else {
      // Insert new draft submission
      ({ data, error } = await supabase
        .from('task_submissions')
        .insert([
          {
            student_email: studentEmail,
            student_name: studentName,
            task_id: taskId,
            task_day: taskDay,
            submission_file_url: submissionFileUrl,
            submission_file_name: submissionFileName,
            submission_file_type: submissionFileType,
            is_submitted: false,
          },
        ])
        .select()
        .single());
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: data.id,
        submission_file_url: data.submission_file_url,
        submission_file_name: data.submission_file_name,
        submitted_at: data.submitted_at,
        is_submitted: data.is_submitted,
      },
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
