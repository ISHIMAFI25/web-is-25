// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get all tasks grouped by day
    const { data: tasks, error } = await supabase
      .from('assignment_list')
      .select('*')
      .order('day', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Group tasks by day
    const groupedTasks = tasks.reduce((acc: any[], task: any) => {
      const existingDay = acc.find(group => group.day === task.day);
      if (existingDay) {
        existingDay.assignments.push({
          id: task.id,
          title: task.title,
          deadline: task.deadline,
          description: task.description,
          attachmentUrl: task.attachment_url,
          instructionFiles: task.instruction_files || [],
          acceptsLinks: task.accepts_links,
          acceptsFiles: task.accepts_files,
          maxFileSize: task.max_file_size,
          createdAt: task.created_at,
          updatedAt: task.updated_at
        });
      } else {
        acc.push({
          day: task.day,
          assignments: [{
            id: task.id,
            title: task.title,
            deadline: task.deadline,
            description: task.description,
            attachmentUrl: task.attachment_url,
            instructionFiles: task.instruction_files || [],
            acceptsLinks: task.accepts_links,
            acceptsFiles: task.accepts_files,
            maxFileSize: task.max_file_size,
            createdAt: task.created_at,
            updatedAt: task.updated_at
          }]
        });
      }
      return acc;
    }, []);

    return NextResponse.json(groupedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
