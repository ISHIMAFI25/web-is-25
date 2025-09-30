// src/app/api/countdown/status/route.ts
import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { countdownSettings } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import postgres from 'postgres';

// Get database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

// GET - Mendapatkan status countdown untuk semua user
export async function GET() {
  try {
    const activeCountdown = await db
      .select()
      .from(countdownSettings)
      .where(eq(countdownSettings.isActive, true))
      .orderBy(desc(countdownSettings.updatedAt))
      .limit(1);

    const countdown = activeCountdown[0];
    
    // Jika tidak ada countdown aktif, return null
    if (!countdown) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    // Cek apakah countdown sudah lewat
    const now = new Date();
    const target = new Date(countdown.targetTime);
    const isExpired = now > target;

    return NextResponse.json({
      success: true,
      data: {
        id: countdown.id,
        title: countdown.title,
        description: countdown.description,
        targetTime: countdown.targetTime,
        showOnlyCountdown: countdown.showOnlyCountdown,
        isExpired,
        timeRemaining: isExpired ? 0 : target.getTime() - now.getTime()
      }
    });
  } catch (error) {
    console.error('Error fetching countdown status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countdown status' },
      { status: 500 }
    );
  }
}