import { supabase } from "@/integrations/supabase/client";
import type { Module } from "@/types/quotation";

export interface DBModule {
  id: string;
  name: string;
  category: string;
  description: string | null;
  base_price_usd: number;
  price_dop: number | null;
  complexity: string | null;
  estimated_hours: number | null;
  tags: string[] | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  project_type: string;
  project_description: string | null;
  selected_modules: Module[];
  total_usd: number | null;
  total_dop: number | null;
  exchange_rate: number | null;
  discount_percent: number | null;
  status: string | null;
  notes: string | null;
  ai_suggestions: any | null;
  created_at: string;
  updated_at: string;
}

export class DatabaseService {
  // Modules
  async getModules(): Promise<DBModule[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async addModule(module: Omit<DBModule, 'id' | 'created_at' | 'updated_at'>): Promise<DBModule> {
    const { data, error } = await supabase
      .from('modules')
      .insert(module)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Exchange Rates
  async getLatestExchangeRate(): Promise<number> {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('currency_from', 'USD')
      .eq('currency_to', 'DOP')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.warn('Could not fetch exchange rate:', error);
      return 60.50; // Default fallback
    }
    return data?.rate || 60.50;
  }

  async updateExchangeRate(): Promise<{ rate: number; source: string }> {
    const { data, error } = await supabase.functions.invoke('update-exchange-rate');
    
    if (error) throw error;
    return data;
  }

  // Quotations
  async saveQuotation(quotation: Omit<Quotation, 'id' | 'created_at' | 'updated_at'>): Promise<Quotation> {
    const { data, error } = await supabase
      .from('quotations')
      .insert({
        ...quotation,
        selected_modules: quotation.selected_modules as any
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      selected_modules: (data.selected_modules as unknown as Module[]) || []
    };
  }

  async getQuotations(): Promise<Quotation[]> {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(q => ({
      ...q,
      selected_modules: (q.selected_modules as unknown as Module[]) || []
    }));
  }

  async getQuotation(id: string): Promise<Quotation | null> {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return {
      ...data,
      selected_modules: (data.selected_modules as unknown as Module[]) || []
    };
  }

  // Knowledge Base
  async getKnowledgeBase(category?: string) {
    let query = supabase
      .from('knowledge_base')
      .select('*')
      .eq('is_active', true)
      .eq('country', 'DO')
      .eq('year', 2025);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Price Research
  async getPriceResearch(serviceType?: string) {
    let query = supabase
      .from('price_research')
      .select('*')
      .eq('is_verified', true);
    
    if (serviceType) {
      query = query.ilike('service_type', `%${serviceType}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

export const db = new DatabaseService();
