// src/app/api/admin/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Interface untuk task dari database
interface TaskData {
  id: string;
  day: number;
  title: string;
  description: string;
  deadline: string;
  accepts_files: boolean;
  accepts_links: boolean;
  max_file_size: number;
  instruction_files: Array<{ url: string; name: string }>;
  instruction_links: Array<{ url: string; title: string }>;
  created_at: string;
  updated_at: string;
}

// Interface untuk grouped tasks
interface GroupedTask {
  day: number;
  assignments: Array<{
    id: string;
    title: string;
    description: string;
    deadline: string;
    acceptsFiles: boolean;
    acceptsLinks: boolean;
    maxFileSize: number;
    instructionFiles: Array<{ url: string; name: string }>;
    instructionLinks: Array<{ url: string; title: string }>;
  }>;
}

export async function GET() {
  try {
    // Temporarily bypass auth for development
    // TODO: Implement proper authentication in production
    
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
    const groupedTasks = (tasks as TaskData[]).reduce((acc: GroupedTask[], task) => {
      const existingDay = acc.find(group => group.day === task.day);
      if (existingDay) {
        existingDay.assignments.push({
          id: task.id,
          title: task.title,
          deadline: task.deadline,
          description: task.description,
          instructionFiles: task.instruction_files || [],
          instructionLinks: task.instruction_links || [],
          acceptsLinks: task.accepts_links,
          acceptsFiles: task.accepts_files,
          maxFileSize: task.max_file_size
        });
      } else {
        acc.push({
          day: task.day,
          assignments: [{
            id: task.id,
            title: task.title,
            deadline: task.deadline,
            description: task.description,
            instructionFiles: task.instruction_files || [],
            instructionLinks: task.instruction_links || [],
            acceptsLinks: task.accepts_links,
            acceptsFiles: task.accepts_files,
            maxFileSize: task.max_file_size
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
      instructionFiles,
      instructionLinks
    } = body;

    // Generate unique task ID
    const taskId = `task-${day}-${Date.now()}`;

    // Insert new task
    const { data: newTask, error } = await supabase
      .from('assignment_list')
      .insert([{
        id: taskId,
        title,
        day,
        deadline,
        description,
        instruction_files: instructionFiles,
        instruction_links: instructionLinks || [],
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
