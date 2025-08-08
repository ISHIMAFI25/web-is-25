import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const path = join(process.cwd(), 'public', 'uploads', filename);

    // Create uploads directory if it doesn't exist
    // Note: uploadsDir is prepared for future use
    await writeFile(path, buffer);

    // Return the URL path
    const fileUrl = `/uploads/${filename}`;
    
    console.log('File uploaded successfully:', fileUrl);
    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
