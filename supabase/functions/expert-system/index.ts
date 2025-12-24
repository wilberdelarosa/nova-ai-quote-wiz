import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpertQuery {
  type: 'analyze' | 'suggest_modules' | 'price_research' | 'optimize' | 'timeline' | 'compare' | 'general';
  query: string;
  context?: {
    projectType?: string;
    selectedModules?: any[];
    clientName?: string;
    budget?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { type, query, context } = await req.json() as ExpertQuery;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch knowledge base
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relevant knowledge from database
    const { data: knowledgeData } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('is_active', true)
      .eq('country', 'DO')
      .eq('year', 2025);

    const { data: priceData } = await supabase
      .from('price_research')
      .select('*')
      .eq('is_verified', true);

    const { data: modulesData } = await supabase
      .from('modules')
      .select('*')
      .eq('is_active', true);

    const { data: exchangeRate } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('currency_from', 'USD')
      .eq('currency_to', 'DOP')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    // Build knowledge context
    const knowledgeContext = knowledgeData?.map(k => 
      `[${k.category}/${k.topic}]: ${k.content} (Confianza: ${k.confidence_score * 100}%)`
    ).join('\n') || '';

    const priceContext = priceData?.map(p => 
      `${p.service_type}: RD$${p.price_min_dop?.toLocaleString()}-${p.price_max_dop?.toLocaleString()} (Promedio: RD$${p.price_avg_dop?.toLocaleString()}, ~$${p.price_usd} USD)`
    ).join('\n') || '';

    const modulesContext = modulesData?.map(m => 
      `- ${m.name} (${m.category}): $${m.base_price_usd} USD - ${m.description || ''} [Complejidad: ${m.complexity}, Horas: ${m.estimated_hours}h]`
    ).join('\n') || '';

    const currentRate = exchangeRate?.rate || 60.50;

    // Build system prompt based on query type
    let systemPrompt = `Eres un Sistema Experto de Cotizaciones para desarrollo de software en República Dominicana 2025.

TASA DE CAMBIO ACTUAL: 1 USD = RD$${currentRate}

BASE DE CONOCIMIENTO DEL MERCADO DOMINICANO:
${knowledgeContext}

INVESTIGACIÓN DE PRECIOS EN RD:
${priceContext}

CATÁLOGO DE MÓDULOS DISPONIBLES:
${modulesContext}

REGLAS DEL SISTEMA EXPERTO:
1. Siempre responde en español dominicano profesional
2. Usa datos reales del mercado dominicano 2025
3. Proporciona precios en USD y RD$ (pesos dominicanos)
4. Considera el ITBIS (18%) cuando sea relevante
5. Sé específico con estimaciones de tiempo y recursos
6. Cuando sugieras módulos, usa EXACTAMENTE los nombres del catálogo
7. Formatea las respuestas de forma clara con listas y secciones

FORMATO DE RESPUESTA:
- Usa HTML simple para formato (sin markdown)
- Usa <strong> para resaltar, <ul>/<li> para listas
- Usa <br> para saltos de línea
- NO uses **, ##, ### u otros símbolos de markdown`;

    // Customize prompt based on query type
    switch (type) {
      case 'suggest_modules':
        systemPrompt += `\n\nTAREA ESPECÍFICA: Analiza el proyecto y sugiere módulos del catálogo.
Para cada módulo sugerido, incluye:
- Nombre exacto del módulo (del catálogo)
- Precio en USD y RD$
- Por qué es necesario
- Prioridad (Alta/Media/Baja)

Formato cada módulo así:
<div class="module-suggestion" data-name="NOMBRE_EXACTO" data-price="PRECIO_USD" data-category="CATEGORIA">
<strong>Nombre del Módulo</strong> - $XXX USD (RD$XX,XXX)
<br>Razón: explicación
<br>Prioridad: Alta/Media/Baja
</div>`;
        break;
      
      case 'price_research':
        systemPrompt += `\n\nTAREA ESPECÍFICA: Investiga y compara precios en el mercado dominicano.
Proporciona rangos de precios, competidores y recomendaciones.
Incluye comparación con precios internacionales cuando sea relevante.`;
        break;
      
      case 'optimize':
        systemPrompt += `\n\nTAREA ESPECÍFICA: Optimiza la cotización actual.
Sugiere cómo reducir costos sin sacrificar calidad.
Identifica módulos que pueden combinarse o eliminarse.
Proporciona alternativas más económicas si existen.`;
        break;
      
      case 'timeline':
        systemPrompt += `\n\nTAREA ESPECÍFICA: Genera un timeline detallado del proyecto.
Considera dependencias entre módulos.
Incluye hitos importantes y entregables.
Sugiere orden óptimo de desarrollo.`;
        break;
      
      case 'analyze':
        systemPrompt += `\n\nTAREA ESPECÍFICA: Realiza un análisis completo del proyecto.
Incluye fortalezas, debilidades, oportunidades y amenazas (FODA).
Evalúa viabilidad técnica y comercial.
Sugiere mejoras y advertencias.`;
        break;
        
      case 'compare':
        systemPrompt += `\n\nTAREA ESPECÍFICA: Compara opciones y alternativas.
Usa tablas comparativas cuando sea útil.
Proporciona pros y contras de cada opción.`;
        break;
    }

    // Add context if provided
    let userMessage = query;
    if (context) {
      userMessage = `CONTEXTO DEL PROYECTO:
- Tipo de proyecto: ${context.projectType || 'No especificado'}
- Cliente: ${context.clientName || 'No especificado'}
- Presupuesto: ${context.budget ? `$${context.budget} USD` : 'No especificado'}
- Módulos seleccionados: ${context.selectedModules?.map(m => m.name).join(', ') || 'Ninguno'}

CONSULTA: ${query}`;
    }

    console.log('Expert System Query:', { type, query: userMessage.substring(0, 100) });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Límite de solicitudes excedido. Intenta de nuevo en unos segundos.",
          code: "RATE_LIMIT"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos de IA agotados. Contacta al administrador.",
          code: "PAYMENT_REQUIRED"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';
    
    const processingTime = Date.now() - startTime;

    // Log the inference for learning
    await supabase.from('ai_inference_logs').insert({
      query_type: type,
      user_query: query,
      ai_response: content,
      context_used: { 
        knowledgeCount: knowledgeData?.length || 0,
        pricesCount: priceData?.length || 0,
        modulesCount: modulesData?.length || 0,
        exchangeRate: currentRate
      },
      processing_time_ms: processingTime,
    });

    // Extract module suggestions if present
    const moduleSuggestions: any[] = [];
    const moduleRegex = /<div class="module-suggestion" data-name="([^"]+)" data-price="([^"]+)" data-category="([^"]+)">/g;
    let match;
    while ((match = moduleRegex.exec(content)) !== null) {
      moduleSuggestions.push({
        name: match[1],
        price: parseFloat(match[2]),
        category: match[3],
      });
    }

    return new Response(JSON.stringify({ 
      content,
      moduleSuggestions,
      metadata: {
        type,
        processingTime,
        knowledgeUsed: knowledgeData?.length || 0,
        exchangeRate: currentRate,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Expert system error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Error del sistema experto",
      code: "SYSTEM_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
