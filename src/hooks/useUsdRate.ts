import { useState, useEffect } from 'react';
import { fetchUsdToDopRate } from '@/services/exchangeRate';

export const useUsdRate = () => {
  const [usdRate, setUsdRate] = useState<number>(60);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updateRate = async () => {
    setIsLoading(true);
    try {
      const rate = await fetchUsdToDopRate();
      setUsdRate(rate);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error updating USD rate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    updateRate();
    
    // Update every 5 minutes
    const interval = setInterval(updateRate, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    usdRate,
    isLoading,
    lastUpdated,
    updateRate
  };
};