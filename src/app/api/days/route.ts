// src/app/api/days/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Interface untuk day data
interface DayData {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  date_time: string | null;
  location: string | null;
  specifications: string | null;
  attachment_files: Array<{ url: string; name: string; size?: number }>;
  attachment_links: Array<{ url: string; title: string; description?: string }>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export async function GET() {
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
    const transformedDays = (days as DayData[]).map((day) => ({
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
