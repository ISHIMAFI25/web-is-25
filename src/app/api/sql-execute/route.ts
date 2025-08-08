// src/app/api/sql-execute/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Security: Only allow certain SQL operations for safety
    const trimmedQuery = query.trim().toLowerCase();
    const operation = trimmedQuery.split(' ')[0];
    
    if (!['select'].includes(operation)) {
      return NextResponse.json(
        { success: false, error: 'Only SELECT operations are allowed for security reasons' },
        { status: 403 }
      );
    }

    // For security, only allow queries on specific tables
    const allowedTables = ['task_submissions'];
    const hasAllowedTable = allowedTables.some(table => 
      trimmedQuery.includes(table)
    );
    
    if (!hasAllowedTable) {
      return NextResponse.json(
        { success: false, error: 'Query must include allowed tables: ' + allowedTables.join(', ') },
        { status: 403 }
      );
    }

    // Execute specific queries based on common patterns
    let data, error;

    if (trimmedQuery.includes('select * from task_submissions')) {
      ({ data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false }));
    } else if (trimmedQuery.includes('is_submitted = true')) {
      ({ data, error } = await supabase
        .from('task_submissions')
        .select('student_name, student_email, submission_file_name, submitted_at')
        .eq('task_id', 'task-0')
        .eq('is_submitted', true)
        .order('submitted_at', { ascending: false }));
    } else if (trimmedQuery.includes('is_submitted = false')) {
      ({ data, error } = await supabase
        .from('task_submissions')
        .select('student_name, student_email, submission_file_name, created_at')
        .eq('task_id', 'task-0')
        .eq('is_submitted', false)
        .order('created_at', { ascending: false }));
    } else if (trimmedQuery.includes('group by') && trimmedQuery.includes('is_submitted')) {
      ({ data, error } = await supabase
        .from('task_submissions')
        .select('task_id, task_day, is_submitted')
        .order('task_day'));
      
      if (data && !error) {
        // Process count and group by manually
        interface GroupedRow {
          task_id: string;
          task_day: number;
          is_submitted: boolean;
          count: number;
        }
        const grouped = data.reduce((acc: Record<string, GroupedRow>, row: Record<string, unknown>) => {
          const key = `${row.task_id}-${row.task_day}-${row.is_submitted}`;
          if (!acc[key]) {
            acc[key] = { 
              task_id: row.task_id as string, 
              task_day: row.task_day as number, 
              is_submitted: row.is_submitted as boolean,
              count: 0 
            };
          }
          acc[key].count++;
          return acc;
        }, {});
        data = Object.values(grouped);
      }
    } else if (trimmedQuery.includes('where task_id = \'task-0\'')) {
      ({ data, error } = await supabase
        .from('task_submissions')
        .select('student_name, student_email, submission_file_name, submitted_at')
        .eq('task_id', 'task-0')
        .order('submitted_at', { ascending: false }));
    } else if (trimmedQuery.includes('count(*)') && trimmedQuery.includes('group by')) {
      ({ data, error } = await supabase
        .from('task_submissions')
        .select('task_id, task_day')
        .order('task_day'));
      
      if (data && !error) {
        // Process count and group by manually
        interface GroupedSubmission {
          task_id: string;
          task_day: number;
          submission_count: number;
        }
        const grouped = data.reduce((acc: Record<string, GroupedSubmission>, row: Record<string, unknown>) => {
          const key = `${row.task_id}-${row.task_day}`;
          if (!acc[key]) {
            acc[key] = { 
              task_id: row.task_id as string, 
              task_day: row.task_day as number, 
              submission_count: 0 
            };
          }
          acc[key].submission_count++;
          return acc;
        }, {});
        data = Object.values(grouped);
      }
    } else {
      // Default: get all submissions
      ({ data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false }));
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to execute query',
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      rowCount: data ? data.length : 0,
      columns: data && data.length > 0 ? Object.keys(data[0]) : [],
    });

  } catch (error) {
    console.error('Error executing SQL:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
