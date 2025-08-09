import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status');
    const approval = searchParams.get('approval');

    let query = supabase
      .from('presensi_lengkap')
      .select('*')
      .order('waktu_presensi', { ascending: false });

    // Filter by session if provided
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status_kehadiran', status);
    }

    // Filter by approval status if provided
    if (approval) {
      query = query.eq('status_approval', approval);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching presensi data:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data presensi' },
        { status: 500 }
      );
    }

    // Count statistics
    const stats = {
      total: data?.length || 0,
      hadir: data?.filter(item => item.status_kehadiran === 'Hadir').length || 0,
      tidak_hadir: data?.filter(item => item.status_kehadiran === 'Tidak Hadir').length || 0,
      menyusul: data?.filter(item => item.status_kehadiran === 'Menyusul').length || 0,
      meninggalkan: data?.filter(item => item.status_kehadiran === 'Meninggalkan').length || 0,
      pending_approval: data?.filter(item => item.status_approval === 'Pending').length || 0,
      disetujui: data?.filter(item => item.status_approval === 'Disetujui').length || 0,
      ditolak: data?.filter(item => item.status_approval === 'Ditolak').length || 0
    };

    // Information for admin
    const adminInfo = {
      manual_approval_note: "Untuk approve/reject: Edit langsung tabel 'presensi_data' di Supabase Dashboard",
      pending_count: stats.pending_approval,
      view_to_use: "Gunakan view 'presensi_untuk_admin' untuk approval yang lebih mudah"
    };

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      stats: stats,
      admin_info: adminInfo
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
