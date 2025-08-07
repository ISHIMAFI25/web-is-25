export async function simpanAbsensi(data: {
  status_kehadiran: string;
  jam: string;
  alasan: string;
  foto_url: string;
  waktu: string;
}) {
  console.log('Client: Attempting to save via API:', data);
  
  try {
    const response = await fetch('/api/absensi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to save data');
    }
    
    console.log('Client: Successfully saved via API:', result.data);
    return result.data;
  } catch (error) {
    console.error('Client: API error:', error);
    throw new Error(`API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}