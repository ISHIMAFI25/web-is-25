import { useState, useEffect } from 'react';

export function usePendingApprovalsCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/admin/attendance-approval');
        const result = await response.json();
        
        if (response.ok && result.success) {
          setCount(result.data.length);
        }
      } catch (error) {
        console.error('Error fetching pending approvals count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    
    // Auto-refresh dimatikan untuk performa yang lebih baik
    // Badge count akan update ketika tab dibuka atau manual refresh
    
    // return () => clearInterval(interval);
  }, []);

  return { count, loading };
}
