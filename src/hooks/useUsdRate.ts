import { useState, useEffect } from 'react';
import { fetchUsdToDopRate, updateExchangeRateFromEdge } from '@/services/exchangeRate';

export const useUsdRate = () => {
  const [usdRate, setUsdRate] = useState<number>(60.50);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<string>('cache');

  const fetchRate = async () => {
    setIsLoading(true);
    try {
      const rate = await fetchUsdToDopRate();
      setUsdRate(rate);
      setLastUpdated(new Date());
      setSource('database');
    } catch (error) {
      console.error('Error fetching USD rate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRate = async () => {
    setIsLoading(true);
    try {
      const rate = await updateExchangeRateFromEdge();
      setUsdRate(rate);
      setLastUpdated(new Date());
      setSource('api');
    } catch (error) {
      console.error('Error updating USD rate:', error);
      // Fallback to database
      await fetchRate();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch from database
    fetchRate();
    
    // Update from API every 30 minutes
    const interval = setInterval(() => {
      updateRate();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    usdRate,
    isLoading,
    lastUpdated,
    source,
    updateRate,
    refreshRate: fetchRate
  };
};
