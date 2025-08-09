// src/app/api/days/upcoming/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching upcoming day...');
    const now = new Date().toISOString();
    console.log('Current time:', now);
    
    // Get the closest upcoming visible day
    const { data: upcomingDays, error } = await supabaseServer
      .from('days')
      .select('*')
      .eq('is_visible', true)
      .gte('date_time', now)
      .order('date_time', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Database error (upcoming):', error);
      throw error;
    }

    console.log('Found upcoming days:', upcomingDays?.length || 0, upcomingDays);

    // If no upcoming days, get the latest past day
    let result = upcomingDays;
    if (!upcomingDays || upcomingDays.length === 0) {
      console.log('No upcoming days, fetching latest past day...');
      const { data: latestDays, error: latestError } = await supabaseServer
        .from('days')
        .select('*')
        .eq('is_visible', true)
        .lt('date_time', now)
        .order('date_time', { ascending: false })
        .limit(1);

      if (latestError) {
        console.error('Database error (latest):', latestError);
        throw latestError;
      }
      
      console.log('Found latest past days:', latestDays?.length || 0, latestDays);
      result = latestDays;
    }

    if (!result || result.length === 0) {
      console.log('No days found at all');
      return NextResponse.json(null);
    }

    const day = result[0];
    console.log('Selected day:', day);
    
    // Transform data to match frontend types
    const transformedDay = {
      id: day.id,
      dayNumber: day.day_number,
      title: day.title,
      description: day.description,
      dateTime: day.date_time,
      location: day.location,
      specifications: day.specifications,
      attachmentFiles: day.attachment_files || [],
      isVisible: day.is_visible,
      createdAt: day.created_at,
      updatedAt: day.updated_at
    };

    return NextResponse.json(transformedDay);
  } catch (error) {
    console.error('Error fetching upcoming day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
