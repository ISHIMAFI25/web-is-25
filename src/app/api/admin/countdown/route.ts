// src/app/api/admin/countdown/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { countdownSettings } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import postgres from 'postgres';

// Get database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

// GET - Mendapatkan countdown yang aktif
export async function GET() {
  try {
    const activeCountdown = await db
      .select()
      .from(countdownSettings)
      .where(eq(countdownSettings.isActive, true))
      .orderBy(desc(countdownSettings.updatedAt))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: activeCountdown[0] || null
    });
  } catch (error) {
    console.error('Error fetching countdown:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countdown' },
      { status: 500 }
    );
  }
}

// POST - Membuat countdown baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, targetTime, showOnlyCountdown } = body;

    // Validasi input
    if (!title || !targetTime) {
      return NextResponse.json(
        { success: false, error: 'Title and target time are required' },
        { status: 400 }
      );
    }

    // Nonaktifkan countdown yang lama
    await db
      .update(countdownSettings)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(countdownSettings.isActive, true));

    // Buat countdown baru
    const newCountdown = await db
      .insert(countdownSettings)
      .values({
        title,
        description: description || '',
        targetTime: new Date(targetTime),
        isActive: true,
        showOnlyCountdown: showOnlyCountdown || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newCountdown[0]
    });
  } catch (error) {
    console.error('Error creating countdown:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create countdown' },
      { status: 500 }
    );
  }
}

// PUT - Update countdown
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, targetTime, isActive, showOnlyCountdown } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Countdown ID is required' },
        { status: 400 }
      );
    }

    const updatedCountdown = await db
      .update(countdownSettings)
      .set({
        title: title,
        description: description,
        targetTime: targetTime ? new Date(targetTime) : undefined,
        isActive: isActive,
        showOnlyCountdown: showOnlyCountdown,
        updatedAt: new Date(),
      })
      .where(eq(countdownSettings.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedCountdown[0]
    });
  } catch (error) {
    console.error('Error updating countdown:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update countdown' },
      { status: 500 }
    );
  }
}

// DELETE - Menghapus countdown
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Countdown ID is required' },
        { status: 400 }
      );
    }

    await db
      .update(countdownSettings)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(countdownSettings.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'Countdown deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating countdown:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate countdown' },
      { status: 500 }
    );
  }
}