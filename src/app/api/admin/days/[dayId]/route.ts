// src/app/api/admin/days/[dayId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Supabase Admin Client for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

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
    const { data: updatedDay, error } = await supabaseAdmin
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
    console.log('🗑️ DELETE day request received for dayId:', dayId);

    // Delete day
    const { data, error } = await supabaseAdmin
      .from('days')
      .delete()
      .eq('id', dayId)
      .select();

    if (error) {
      console.error('❌ Supabase delete error:', error);
      throw error;
    }

    console.log('✅ Day deletion successful:', data);
    return NextResponse.json({ success: true, deletedData: data });
  } catch (error) {
    console.error('❌ Error deleting day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
