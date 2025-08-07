import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API: Received data:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.status_kehadiran) {
      throw new Error('status_kehadiran is required');
    }
    
    const insertData = {
      status_kehadiran: body.status_kehadiran,
      jam: body.jam || '',
      alasan: body.alasan || '',
      foto_url: body.foto_url || '',
      waktu: body.waktu,
    };
    
    console.log('API: Inserting data:', JSON.stringify(insertData, null, 2));
    
    const { data, error } = await supabase
      .from('absensi')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error('API: Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('API: Successfully saved to database:', JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      data: data 
    });
  } catch (error) {
    console.error('API: Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
