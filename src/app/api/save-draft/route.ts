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

    // Default to 'file' if submissionType is not provided (backward compatibility)
    const finalSubmissionType = submissionType || 'file';

    // Validate submission type and content
    if (finalSubmissionType === 'file' && (!submissionFileUrl || !submissionFileName)) {
      return NextResponse.json(
        { error: 'File URL and name are required for file submissions' },
        { status: 400 }
      );
    }

    if (finalSubmissionType === 'link' && !submissionLink) {
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
      submission_type: finalSubmissionType,
      is_submitted: false,
      updated_at: new Date().toISOString(),
    };

    if (finalSubmissionType === 'file') {
      updateData.submission_file_url = submissionFileUrl;
      updateData.submission_file_name = submissionFileName;
      updateData.submission_file_type = submissionFileType;
      updateData.submission_link = null; // Clear link if switching to file
    } else if (finalSubmissionType === 'link') {
      updateData.submission_link = submissionLink;
      updateData.submission_file_url = null; // Clear file data if switching to link
      updateData.submission_file_name = null;
      updateData.submission_file_type = null;
    } else if (finalSubmissionType === 'both') {
      updateData.submission_file_url = submissionFileUrl;
      updateData.submission_file_name = submissionFileName;
      updateData.submission_file_type = submissionFileType;
      updateData.submission_link = submissionLink;
    }

    if (existingSubmission) {
      // Update existing submission as draft
      ({ data, error } = await supabase
        .from('task_submissions')
        .update(updateData)
        .eq('id', existingSubmission.id)
        .select()
        .single());
    } else {
      // Insert new draft submission
      const insertData = {
        student_email: studentEmail,
        student_name: studentName,
        task_id: taskId,
        task_day: taskDay,
        submission_status: 'draft',
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
        submission_link: data.submission_link,
        submission_type: data.submission_type,
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
