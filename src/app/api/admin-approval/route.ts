import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Ambil data presensi yang perlu approval
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_approval_queue')
      .select('*')
      .order('waktu_presensi', { ascending: true });

    if (error) {
      console.error('Error fetching approval queue:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data approval' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Update status approval
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Admin approval request:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.presensi_id || !body.status || !body.admin_email) {
      return NextResponse.json(
        { error: 'presensi_id, status, dan admin_email diperlukan' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['Disetujui', 'Ditolak'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status harus Disetujui atau Ditolak' },
        { status: 400 }
      );
    }

    // Use the stored function for approval
    const { data, error } = await supabase
      .rpc('admin_update_approval', {
        presensi_id: body.presensi_id,
        new_status: body.status,
        admin_email: body.admin_email,
        admin_feedback: body.feedback || null
      });

    if (error) {
      console.error('Supabase RPC error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Presensi tidak ditemukan atau sudah diproses' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Presensi berhasil ${body.status.toLowerCase()}`,
      data: { 
        presensi_id: body.presensi_id,
        status: body.status,
        feedback: body.feedback 
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
