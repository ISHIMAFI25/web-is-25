// src/app/api/admin/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass auth for development
    // TODO: Implement proper authentication in production
    
    // Get all tasks grouped by day
    const { data: tasks, error } = await supabase
      .from('assignments')
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

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass auth for development
    // TODO: Implement proper authentication in production
    
    const body = await request.json();
    const {
      title,
      day,
      deadline,
      description,
      acceptsLinks,
      acceptsFiles,
      maxFileSize,
      instructionFiles
    } = body;

    // Generate unique task ID
    const taskId = `task-${day}-${Date.now()}`;

    // Insert new task
    const { data: newTask, error } = await supabase
      .from('assignments')
      .insert([{
        id: taskId,
        title,
        day,
        deadline,
        description,
        instruction_files: instructionFiles,
        accepts_links: acceptsLinks,
        accepts_files: acceptsFiles,
        max_file_size: maxFileSize,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
