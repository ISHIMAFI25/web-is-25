// src/app/api/days/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching visible days...');
    
    // Get only visible days ordered by day_number
    const { data: days, error } = await supabaseServer
      .from('days')
      .select('*')
      .eq('is_visible', true)
      .order('day_number', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Found days:', days?.length || 0, days);

    // Transform data to match frontend types - keep snake_case to match DB
    const transformedDays = days.map((day: any) => ({
      id: day.id,
      day_number: day.day_number,
      title: day.title,
      description: day.description,
      date_time: day.date_time,
      location: day.location,
      specifications: day.specifications,
      attachment_files: day.attachment_files || [],
      attachment_links: day.attachment_links || [],
      is_visible: day.is_visible,
      created_at: day.created_at,
      updated_at: day.updated_at
    }));

    return NextResponse.json({ days: transformedDays });
  } catch (error) {
    console.error('Error fetching visible days:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
