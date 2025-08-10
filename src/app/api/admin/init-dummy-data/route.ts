// src/app/api/admin/init-dummy-data/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import dummyAssignments from '@/lib/dummyAssignments';

export async function POST() {
  try {
    // Temporarily bypass auth for development
    // TODO: Implement proper authentication in production
    
    console.log('Initializing dummy data...');
    
    // Clear existing assignments first (optional - remove if you want to keep existing data)
    // await supabase.from('assignment_list').delete().gte('id', '');
    
    // Insert dummy assignments
    for (const dayGroup of dummyAssignments) {
      for (const assignment of dayGroup.assignments) {
        const { error } = await supabase
          .from('assignment_list')
          .upsert([{
            id: assignment.id,
            title: assignment.title,
            day: dayGroup.day,
            deadline: assignment.deadline,
            description: assignment.description,
            instruction_files: assignment.instructionFiles,
            accepts_links: assignment.acceptsLinks,
            accepts_files: assignment.acceptsFiles,
            max_file_size: assignment.maxFileSize,
            attachment_url: assignment.attachmentUrl,
            created_at: assignment.createdAt,
            updated_at: assignment.updatedAt
          }], {
            onConflict: 'id'
          });

        if (error) {
          console.error('Error inserting assignment:', assignment.id, error);
          throw error;
        }
        
        console.log('Inserted assignment:', assignment.id);
      }
    }

    return NextResponse.json({ 
      message: 'Dummy data initialized successfully',
      insertedTasks: dummyAssignments.reduce((total, group) => total + group.assignments.length, 0)
    });
  } catch (error) {
    console.error('Error initializing dummy data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
