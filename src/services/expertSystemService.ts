import { supabase } from "@/integrations/supabase/client";
import type { Module } from "@/types/quotation";

export type QueryType = 'analyze' | 'suggest_modules' | 'price_research' | 'optimize' | 'timeline' | 'compare' | 'general';

export interface ExpertContext {
  projectType?: string;
  selectedModules?: Module[];
  clientName?: string;
  budget?: number;
}

export interface ExpertResponse {
  content: string;
  moduleSuggestions: Array<{
    name: string;
    price: number;
    category: string;
  }>;
  metadata: {
    type: QueryType;
    processingTime: number;
    knowledgeUsed: number;
    exchangeRate: number;
  };
}

export class ExpertSystemService {
  async query(type: QueryType, query: string, context?: ExpertContext): Promise<ExpertResponse> {
    const { data, error } = await supabase.functions.invoke('expert-system', {
      body: { type, query, context }
    });

    if (error) {
      console.error('Expert system error:', error);
      throw new Error(error.message || 'Error del sistema experto');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data as ExpertResponse;
  }

  async analyzeProject(clientName: string, projectType: string, selectedModules: Module[]): Promise<ExpertResponse> {
    return this.query('analyze', 
      `Analiza este proyecto completo y proporciona un análisis FODA, evaluación técnica y recomendaciones.`,
      { clientName, projectType, selectedModules }
    );
  }

  async suggestModules(projectType: string, selectedModules: Module[]): Promise<ExpertResponse> {
    return this.query('suggest_modules',
      `Analiza los módulos actuales y sugiere qué módulos importantes faltan para este tipo de proyecto.`,
      { projectType, selectedModules }
    );
  }

  async optimizePricing(selectedModules: Module[], budget?: number): Promise<ExpertResponse> {
    return this.query('optimize',
      `Optimiza la cotización actual. Sugiere cómo reducir costos sin sacrificar calidad.`,
      { selectedModules, budget }
    );
  }

  async generateTimeline(selectedModules: Module[]): Promise<ExpertResponse> {
    return this.query('timeline',
      `Genera un cronograma detallado de desarrollo con fases, dependencias y entregables.`,
      { selectedModules }
    );
  }

  async researchPrices(serviceType: string): Promise<ExpertResponse> {
    return this.query('price_research',
      `Investiga los precios actuales del mercado dominicano 2025 para: ${serviceType}`,
      {}
    );
  }

  async compareOptions(options: string): Promise<ExpertResponse> {
    return this.query('compare',
      options,
      {}
    );
  }

  async generalQuery(query: string, context?: ExpertContext): Promise<ExpertResponse> {
    return this.query('general', query, context);
  }
}

export const expertSystem = new ExpertSystemService();
