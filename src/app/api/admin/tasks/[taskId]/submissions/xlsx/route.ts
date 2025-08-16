// src/app/api/admin/tasks/[taskId]/submissions/xlsx/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import ExcelJS from 'exceljs';

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
      console.error('Error fetching submissions for XLSX:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    const rows = data || [];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Submissions');

    const columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Student Email', key: 'student_email', width: 28 },
      { header: 'Student Name', key: 'student_name', width: 24 },
      { header: 'Task ID', key: 'task_id', width: 22 },
      { header: 'Task Day', key: 'task_day', width: 10 },
      { header: 'Submission Type', key: 'submission_type', width: 14 },
      { header: 'File URL', key: 'submission_file_url', width: 40 },
      { header: 'File Name', key: 'submission_file_name', width: 30 },
      { header: 'File Type', key: 'submission_file_type', width: 14 },
      { header: 'Submission Link', key: 'submission_link', width: 40 },
      { header: 'Status', key: 'submission_status', width: 12 },
      { header: 'Is Submitted', key: 'is_submitted', width: 12 },
      { header: 'Submitted At', key: 'submitted_at', width: 22 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 }
    ];
    sheet.columns = columns as any;

    rows.forEach(r => {
      sheet.addRow({
        ...r,
        submitted_at: r.submitted_at ? new Date(r.submitted_at).toISOString() : '',
        created_at: r.created_at ? new Date(r.created_at).toISOString() : '',
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : ''
      });
    });

    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="task_${taskId}_submissions.xlsx"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    console.error('XLSX export error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
