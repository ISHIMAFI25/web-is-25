// Utility functions untuk handling timezone Asia/Jakarta

/**
 * Konversi datetime-local input ke ISO string dengan timezone Asia/Jakarta
 * @param datetimeLocal - String dari input datetime-local (format: "2025-08-10T17:00")
 * @returns ISO string dengan timezone +07:00 atau null jika input kosong
 */
export function convertToJakartaTimezone(datetimeLocal: string): string | null {
  if (!datetimeLocal) return null;
  
  // Tambahkan detik dan timezone offset untuk Asia/Jakarta
  // Input: "2025-08-10T17:00" -> Output: "2025-08-10T17:00:00+07:00"
  return datetimeLocal + ':00+07:00';
}

/**
 * Konversi ISO string ke format untuk datetime-local input
 * @param isoString - ISO datetime string dengan timezone
 * @returns String format datetime-local atau empty string jika invalid
 */
export function convertFromJakartaTimezone(isoString: string): string {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    // Konversi ke Asia/Jakarta timezone dan format untuk datetime-local
    const jakartaTime = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
    
    // Format output: "2025-08-10 17:00" -> "2025-08-10T17:00"
    return jakartaTime.replace(' ', 'T');
  } catch (error) {
    console.error('Error converting from Jakarta timezone:', error);
    return '';
  }
}

/**
 * Format datetime dengan timezone Asia/Jakarta untuk display
 * @param dateString - ISO datetime string
 * @returns Formatted string dalam bahasa Indonesia
 */
export function formatJakartaDateTime(dateString: string | null): string {
  if (!dateString) return '-';
  
  try {
    return new Date(dateString).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting Jakarta datetime:', error);
    return 'Invalid Date';
  }
}

/**
 * Cek apakah waktu sudah mencapai auto-close time dengan timezone Asia/Jakarta
 * @param autoCloseTime - ISO datetime string
 * @returns true jika sudah melewati waktu auto-close
 */
export function isAutoCloseTimeReached(autoCloseTime: string | null): boolean {
  if (!autoCloseTime) return false;
  
  try {
    const autoCloseDate = new Date(autoCloseTime);
    const now = new Date();
    return now >= autoCloseDate;
  } catch (error) {
    console.error('Error checking auto-close time:', error);
    return false;
  }
}

/**
 * Validasi apakah auto-close time di masa depan
 * @param autoCloseTime - ISO datetime string
 * @returns true jika waktu valid (di masa depan)
 */
export function validateAutoCloseTime(autoCloseTime: string | null): boolean {
  if (!autoCloseTime) return true; // null/empty is valid (optional)
  
  try {
    const autoCloseDate = new Date(autoCloseTime);
    const now = new Date();
    return autoCloseDate > now;
  } catch (error) {
    console.error('Error validating auto-close time:', error);
    return false;
  }
}
