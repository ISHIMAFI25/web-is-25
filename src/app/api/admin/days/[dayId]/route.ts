// src/app/api/admin/days/[dayId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    const { dayId } = await params;
    const body = await request.json();
    const {
      dayNumber,
      title,
      description,
      dateTime,
      location,
      specifications,
      attachmentFiles,
      attachmentLinks,
      isVisible
    } = body;

    // Update day
    const { data: updatedDay, error } = await supabase
      .from('days')
      .update({
        day_number: dayNumber,
        title,
        description,
        date_time: dateTime,
        location,
        specifications: specifications || null,
        attachment_files: attachmentFiles,
        attachment_links: attachmentLinks || [],
        is_visible: isVisible,
        updated_at: new Date().toISOString()
      })
      .eq('id', dayId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedDay);
  } catch (error) {
    console.error('Error updating day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    const { dayId } = await params;

    // Delete day
    const { error } = await supabase
      .from('days')
      .delete()
      .eq('id', dayId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
