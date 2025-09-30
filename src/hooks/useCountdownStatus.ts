// src/hooks/useCountdownStatus.ts
import { useState, useEffect } from 'react';

interface CountdownStatus {
  id?: number;
  title?: string;
  description?: string;
  targetTime?: string;
  showOnlyCountdown?: boolean;
  isExpired?: boolean;
  timeRemaining?: number;
}

export function useCountdownStatus() {
  const [countdownStatus, setCountdownStatus] = useState<CountdownStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountdownStatus = async () => {
    try {
      const response = await fetch('/api/countdown/status');
      const result = await response.json();

      if (result.success) {
        setCountdownStatus(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch countdown status');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching countdown status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountdownStatus();
    
    // Refresh setiap 30 detik
    const interval = setInterval(fetchCountdownStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    countdownStatus,
    loading,
    error,
    refetch: fetchCountdownStatus
  };
}