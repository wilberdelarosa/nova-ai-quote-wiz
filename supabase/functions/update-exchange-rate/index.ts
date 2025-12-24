import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try multiple sources for USD/DOP rate
    let rate = 60.50; // Default fallback
    let source = 'Default';

    try {
      // Try exchangerate-api (free tier)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (response.ok) {
        const data = await response.json();
        if (data.rates?.DOP) {
          rate = data.rates.DOP;
          source = 'exchangerate-api.com';
        }
      }
    } catch (e) {
      console.log('exchangerate-api failed, trying fallback');
    }

    if (source === 'Default') {
      try {
        // Fallback to open.er-api
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (response.ok) {
          const data = await response.json();
          if (data.rates?.DOP) {
            rate = data.rates.DOP;
            source = 'open.er-api.com';
          }
        }
      } catch (e) {
        console.log('open.er-api failed, using default rate');
      }
    }

    // Insert new rate
    const { data, error } = await supabase
      .from('exchange_rates')
      .insert({
        currency_from: 'USD',
        currency_to: 'DOP',
        rate: rate,
        source: source,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Exchange rate updated:', { rate, source });

    return new Response(JSON.stringify({ 
      success: true,
      rate,
      source,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Exchange rate update error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Error actualizando tasa",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
