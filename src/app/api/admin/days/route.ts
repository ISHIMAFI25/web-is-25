// src/app/api/admin/days/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get all days ordered by day_number
    const { data: days, error } = await supabase
      .from('days')
      .select('*')
      .order('day_number', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform data to match frontend types
    const transformedDays = days.map((day: any) => ({
      id: day.id,
      dayNumber: day.day_number,
      title: day.title,
      description: day.description,
      dateTime: day.date_time,
      location: day.location,
      specifications: day.specifications,
      attachmentFiles: day.attachment_files || [],
      attachmentLinks: day.attachment_links || [],
      isVisible: day.is_visible,
      createdAt: day.created_at,
      updatedAt: day.updated_at
    }));

    return NextResponse.json({ days: transformedDays });
  } catch (error) {
    console.error('Error fetching days:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Generate unique day ID
    const dayId = `day-${dayNumber}-${Date.now()}`;

    // Insert new day
    const { data: newDay, error } = await supabase
      .from('days')
      .insert([{
        id: dayId,
        day_number: dayNumber,
        title,
        description,
        date_time: dateTime,
        location,
        specifications: specifications || null,
        attachment_files: attachmentFiles,
        attachment_links: attachmentLinks || [],
        is_visible: isVisible,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newDay);
  } catch (error) {
    console.error('Error creating day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
