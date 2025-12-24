export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_inference_logs: {
        Row: {
          ai_response: string | null
          confidence_score: number | null
          context_used: Json | null
          created_at: string
          feedback: string | null
          id: string
          processing_time_ms: number | null
          query_type: string
          user_query: string
          was_helpful: boolean | null
        }
        Insert: {
          ai_response?: string | null
          confidence_score?: number | null
          context_used?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          processing_time_ms?: number | null
          query_type: string
          user_query: string
          was_helpful?: boolean | null
        }
        Update: {
          ai_response?: string | null
          confidence_score?: number | null
          context_used?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          processing_time_ms?: number | null
          query_type?: string
          user_query?: string
          was_helpful?: boolean | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          currency_from: string | null
          currency_to: string | null
          fetched_at: string
          id: string
          rate: number
          source: string | null
        }
        Insert: {
          currency_from?: string | null
          currency_to?: string | null
          fetched_at?: string
          id?: string
          rate: number
          source?: string | null
        }
        Update: {
          currency_from?: string | null
          currency_to?: string | null
          fetched_at?: string
          id?: string
          rate?: number
          source?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string
          confidence_score: number | null
          content: string
          country: string | null
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          last_verified: string | null
          source: string | null
          topic: string
          updated_at: string
          year: number | null
        }
        Insert: {
          category: string
          confidence_score?: number | null
          content: string
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          last_verified?: string | null
          source?: string | null
          topic: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          category?: string
          confidence_score?: number | null
          content?: string
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          last_verified?: string | null
          source?: string | null
          topic?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          base_price_usd: number
          category: string
          complexity: string | null
          created_at: string
          description: string | null
          estimated_hours: number | null
          id: string
          is_active: boolean | null
          name: string
          price_dop: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          base_price_usd: number
          category: string
          complexity?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price_dop?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          base_price_usd?: number
          category?: string
          complexity?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_dop?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      price_research: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          notes: string | null
          price_avg_dop: number | null
          price_max_dop: number | null
          price_min_dop: number | null
          price_usd: number | null
          provider_name: string | null
          region: string | null
          research_source: string | null
          service_type: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          price_avg_dop?: number | null
          price_max_dop?: number | null
          price_min_dop?: number | null
          price_usd?: number | null
          provider_name?: string | null
          region?: string | null
          research_source?: string | null
          service_type: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          price_avg_dop?: number | null
          price_max_dop?: number | null
          price_min_dop?: number | null
          price_usd?: number | null
          provider_name?: string | null
          region?: string | null
          research_source?: string | null
          service_type?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      quotations: {
        Row: {
          ai_suggestions: Json | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          discount_percent: number | null
          exchange_rate: number | null
          id: string
          notes: string | null
          project_description: string | null
          project_type: string
          selected_modules: Json | null
          status: string | null
          total_dop: number | null
          total_usd: number | null
          updated_at: string
        }
        Insert: {
          ai_suggestions?: Json | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          discount_percent?: number | null
          exchange_rate?: number | null
          id?: string
          notes?: string | null
          project_description?: string | null
          project_type: string
          selected_modules?: Json | null
          status?: string | null
          total_dop?: number | null
          total_usd?: number | null
          updated_at?: string
        }
        Update: {
          ai_suggestions?: Json | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          discount_percent?: number | null
          exchange_rate?: number | null
          id?: string
          notes?: string | null
          project_description?: string | null
          project_type?: string
          selected_modules?: Json | null
          status?: string | null
          total_dop?: number | null
          total_usd?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
