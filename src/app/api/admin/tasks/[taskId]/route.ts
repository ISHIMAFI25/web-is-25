// src/app/api/admin/tasks/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Temporarily bypass auth for development
    // TODO: Implement proper authentication in production

    const { taskId } = params;
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

    // Update task
    const { data: updatedTask, error } = await supabase
      .from('assignments')
      .update({
        title,
        day,
        deadline,
        description,
        instruction_files: instructionFiles,
        accepts_links: acceptsLinks,
        accepts_files: acceptsFiles,
        max_file_size: maxFileSize,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Temporarily bypass auth for development
    // TODO: Implement proper authentication in production

    const { taskId } = params;

    // Delete task
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
