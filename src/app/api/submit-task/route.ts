// src/app/api/submit-task/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const {
      studentEmail,
      studentName,
      taskId,
      taskDay,
      submissionType,
      submissionFileUrl,
      submissionFileName,
      submissionFileType,
      submissionLink,
    } = await request.json();

    if (!studentEmail || !studentName || !taskId || taskDay === undefined || taskDay === null) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Validate submission content based on type
    if (submissionType === 'file' && (!submissionFileUrl || !submissionFileName)) {
      return NextResponse.json(
        { error: 'File URL and name are required for file submissions' },
        { status: 400 }
      );
    }

    if (submissionType === 'link' && !submissionLink) {
      return NextResponse.json(
        { error: 'Submission link is required for link submissions' },
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

    const updateData: any = {
      submission_type: submissionType,
      is_submitted: true,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submission_status: 'submitted',
    };

    if (submissionType === 'file') {
      updateData.submission_file_url = submissionFileUrl;
      updateData.submission_file_name = submissionFileName;
      updateData.submission_file_type = submissionFileType;
      updateData.submission_link = null;
    } else if (submissionType === 'link') {
      updateData.submission_link = submissionLink;
      updateData.submission_file_url = null;
      updateData.submission_file_name = null;
      updateData.submission_file_type = null;
    }

    if (existingSubmission) {
      // Update existing submission
      ({ data, error } = await supabase
        .from('task_submissions')
        .update(updateData)
        .eq('id', existingSubmission.id)
        .select()
        .single());
    } else {
      // Insert new submission
      const insertData = {
        student_email: studentEmail,
        student_name: studentName,
        task_id: taskId,
        task_day: taskDay,
        ...updateData,
        created_at: new Date().toISOString(),
      };

      ({ data, error } = await supabase
        .from('task_submissions')
        .insert([insertData])
        .select()
        .single());
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: data.id,
        submission_file_url: data.submission_file_url,
        submission_file_name: data.submission_file_name,
        submission_link: data.submission_link,
        submission_type: data.submission_type,
        submitted_at: data.submitted_at,
        is_submitted: data.is_submitted,
      },
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
