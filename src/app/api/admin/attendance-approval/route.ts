import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Ambil data presensi yang pending approval
export async function GET(request: NextRequest) {
  try {
    // Get pending attendance approvals using database function
    const { data, error } = await supabase
      .rpc('get_pending_attendance_approvals');

    if (error) {
      console.error('Error fetching pending approvals:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data pending approvals' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Error in GET /api/admin/attendance-approval:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update status approval presensi
export async function PUT(request: NextRequest) {
  try {
    const { attendanceId, statusApproval, feedbackAdmin } = await request.json();

    if (!attendanceId || !statusApproval) {
      return NextResponse.json(
        { error: 'Attendance ID dan status approval diperlukan' },
        { status: 400 }
      );
    }

    // Validate status approval
    if (!['Disetujui', 'Ditolak'].includes(statusApproval)) {
      return NextResponse.json(
        { error: 'Status approval harus Disetujui atau Ditolak' },
        { status: 400 }
      );
    }

    // Update attendance approval using database function
    const { data, error } = await supabase
      .rpc('update_attendance_approval', {
        p_attendance_id: attendanceId,
        p_status_approval: statusApproval,
        p_feedback_admin: feedbackAdmin || null
      });

    if (error) {
      console.error('Error updating attendance approval:', error);
      return NextResponse.json(
        { error: 'Gagal mengupdate status approval' },
        { status: 500 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in PUT /api/admin/attendance-approval:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
