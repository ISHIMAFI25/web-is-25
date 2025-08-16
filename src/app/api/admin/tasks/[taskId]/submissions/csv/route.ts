// src/app/api/admin/tasks/[taskId]/submissions/csv/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface TaskSubmissionRow {
  id: number;
  student_email: string;
  student_name: string;
  task_id: string;
  task_day: number;
  submission_type: 'file' | 'link' | 'both' | string;
  submission_file_url: string | null;
  submission_file_name: string | null;
  submission_file_type: string | null;
  submission_link: string | null;
  submission_status: 'draft' | 'submitted' | string;
  is_submitted: boolean | null;
  submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Allow additional unknown keys without using any
  [key: string]: unknown;
}

type ColumnKey = keyof TaskSubmissionRow;

// Escape CSV fields safely
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    if (!taskId) return NextResponse.json({ error: 'taskId is required' }, { status: 400 });

    const { data, error } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('task_id', taskId)
      .order('student_email', { ascending: true });

    if (error) {
      console.error('Error fetching submissions for CSV:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

  const rows: TaskSubmissionRow[] = (data as TaskSubmissionRow[]) || [];
  const columns: Array<{ key: ColumnKey; header: string }> = [
      { key: 'id', header: 'id' },
      { key: 'student_email', header: 'student_email' },
      { key: 'student_name', header: 'student_name' },
      { key: 'task_id', header: 'task_id' },
      { key: 'task_day', header: 'task_day' },
      { key: 'submission_type', header: 'submission_type' },
      { key: 'submission_file_url', header: 'submission_file_url' },
      { key: 'submission_file_name', header: 'submission_file_name' },
      { key: 'submission_file_type', header: 'submission_file_type' },
      { key: 'submission_link', header: 'submission_link' },
      { key: 'submission_status', header: 'submission_status' },
      { key: 'is_submitted', header: 'is_submitted' },
      { key: 'submitted_at', header: 'submitted_at' },
      { key: 'created_at', header: 'created_at' },
      { key: 'updated_at', header: 'updated_at' }
    ];

    const headerLine = columns.map(c => c.header).join(',');
    const dataLines = rows.map(r => columns.map(c => {
      const val = r[c.key];
      return csvEscape(val);
    }).join(','));

    const csv = [headerLine, ...dataLines].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="task_${taskId}_submissions.csv"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    console.error('CSV export error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
