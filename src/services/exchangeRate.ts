import { supabase } from "@/integrations/supabase/client";

const FALLBACK_RATE = 60.50;

export async function fetchUsdToDopRate(): Promise<number> {
  try {
    // First, try to get the rate from our database
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate, fetched_at')
      .eq('currency_from', 'USD')
      .eq('currency_to', 'DOP')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      console.log('Exchange rate from DB:', data.rate, 'fetched at:', data.fetched_at);
      return Number(data.rate) || FALLBACK_RATE;
    }

    console.warn('No exchange rate found in database, using fallback');
    return FALLBACK_RATE;
  } catch (error) {
    console.error('Error fetching USD rate:', error);
    return FALLBACK_RATE;
  }
}

export async function updateExchangeRateFromEdge(): Promise<number> {
  try {
    const { data, error } = await supabase.functions.invoke('update-exchange-rate');
    
    if (error) {
      console.error('Error updating exchange rate:', error);
      return FALLBACK_RATE;
    }
    
    return data?.rate || FALLBACK_RATE;
  } catch (error) {
    console.error('Error calling update-exchange-rate function:', error);
    return FALLBACK_RATE;
  }
}
