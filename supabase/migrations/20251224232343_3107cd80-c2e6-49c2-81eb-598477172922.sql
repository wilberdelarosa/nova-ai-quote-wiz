-- Create modules table for storing quotation modules
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price_usd DECIMAL(10,2) NOT NULL,
  price_dop DECIMAL(10,2),
  complexity TEXT DEFAULT 'medium',
  estimated_hours INTEGER,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge base table for expert system
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[],
  source TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT now(),
  country TEXT DEFAULT 'DO',
  year INTEGER DEFAULT 2025,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price research table for Dominican Republic market
CREATE TABLE public.price_research (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL,
  provider_name TEXT,
  price_min_dop DECIMAL(10,2),
  price_max_dop DECIMAL(10,2),
  price_avg_dop DECIMAL(10,2),
  price_usd DECIMAL(10,2),
  region TEXT DEFAULT 'Santo Domingo',
  research_source TEXT,
  notes TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  project_type TEXT NOT NULL,
  project_description TEXT,
  selected_modules JSONB DEFAULT '[]',
  total_usd DECIMAL(10,2),
  total_dop DECIMAL(10,2),
  exchange_rate DECIMAL(10,4),
  discount_percent DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  ai_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI inference logs for expert system learning
CREATE TABLE public.ai_inference_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_type TEXT NOT NULL,
  user_query TEXT NOT NULL,
  ai_response TEXT,
  context_used JSONB,
  confidence_score DECIMAL(3,2),
  was_helpful BOOLEAN,
  feedback TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exchange rate history
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency_from TEXT DEFAULT 'USD',
  currency_to TEXT DEFAULT 'DOP',
  rate DECIMAL(10,4) NOT NULL,
  source TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_inference_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create public read policies (these are reference tables)
CREATE POLICY "Public read access for modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Public read access for knowledge_base" ON public.knowledge_base FOR SELECT USING (true);
CREATE POLICY "Public read access for price_research" ON public.price_research FOR SELECT USING (true);
CREATE POLICY "Public read access for exchange_rates" ON public.exchange_rates FOR SELECT USING (true);

-- Public insert for quotations and logs (no auth required for demo)
CREATE POLICY "Public access for quotations" ON public.quotations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for ai_inference_logs" ON public.ai_inference_logs FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_price_research_updated_at BEFORE UPDATE ON public.price_research FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial modules data
INSERT INTO public.modules (name, category, description, base_price_usd, complexity, estimated_hours, tags) VALUES
('Landing Page', 'Frontend', 'Página de aterrizaje responsive con diseño moderno', 150.00, 'low', 8, ARRAY['web', 'diseño', 'responsive']),
('Sistema de Login', 'Autenticación', 'Autenticación completa con email y contraseña', 200.00, 'medium', 12, ARRAY['auth', 'seguridad', 'usuarios']),
('Login Social', 'Autenticación', 'Login con Google, Facebook, GitHub', 150.00, 'medium', 8, ARRAY['oauth', 'social', 'auth']),
('Dashboard Admin', 'Backend', 'Panel de administración completo', 400.00, 'high', 24, ARRAY['admin', 'dashboard', 'gestión']),
('Base de Datos', 'Backend', 'Diseño e implementación de base de datos', 250.00, 'medium', 16, ARRAY['database', 'postgresql', 'diseño']),
('API REST', 'Backend', 'API RESTful completa con documentación', 350.00, 'high', 20, ARRAY['api', 'rest', 'backend']),
('Pasarela de Pagos', 'Pagos', 'Integración con Stripe/PayPal', 300.00, 'high', 16, ARRAY['pagos', 'stripe', 'ecommerce']),
('Carrito de Compras', 'E-commerce', 'Sistema de carrito completo', 280.00, 'medium', 14, ARRAY['ecommerce', 'carrito', 'ventas']),
('Chat en Tiempo Real', 'Comunicación', 'Chat con WebSockets', 320.00, 'high', 18, ARRAY['chat', 'realtime', 'websocket']),
('Notificaciones Push', 'Comunicación', 'Sistema de notificaciones push', 180.00, 'medium', 10, ARRAY['notificaciones', 'push', 'mobile']),
('SEO Optimización', 'Marketing', 'Optimización SEO completa', 200.00, 'medium', 12, ARRAY['seo', 'marketing', 'google']),
('Analytics', 'Marketing', 'Integración con Google Analytics y dashboards', 150.00, 'low', 8, ARRAY['analytics', 'métricas', 'reportes']),
('Formularios Dinámicos', 'Frontend', 'Formularios con validación avanzada', 120.00, 'low', 6, ARRAY['forms', 'validación', 'frontend']),
('Upload de Archivos', 'Storage', 'Sistema de carga de archivos y imágenes', 180.00, 'medium', 10, ARRAY['upload', 'storage', 'archivos']),
('PWA', 'Mobile', 'Conversión a Progressive Web App', 250.00, 'medium', 14, ARRAY['pwa', 'mobile', 'offline']),
('Integración IA', 'IA', 'Chatbot o asistente con IA', 400.00, 'high', 24, ARRAY['ia', 'chatbot', 'ai']),
('Reportes PDF', 'Documentos', 'Generación de reportes en PDF', 150.00, 'medium', 8, ARRAY['pdf', 'reportes', 'documentos']),
('Multi-idioma', 'i18n', 'Soporte para múltiples idiomas', 200.00, 'medium', 12, ARRAY['i18n', 'idiomas', 'traducción']),
('Testing', 'QA', 'Tests unitarios e integración', 180.00, 'medium', 10, ARRAY['testing', 'qa', 'calidad']),
('Deploy & CI/CD', 'DevOps', 'Configuración de deployment y CI/CD', 220.00, 'medium', 12, ARRAY['deploy', 'cicd', 'devops']);

-- Insert knowledge base for Dominican Republic tech market 2025
INSERT INTO public.knowledge_base (category, topic, content, keywords, source, confidence_score, country, year) VALUES
('precios', 'desarrollo_web', 'En República Dominicana 2025, el desarrollo web básico oscila entre RD$15,000 y RD$50,000. Proyectos complejos pueden superar RD$200,000.', ARRAY['precios', 'web', 'desarrollo', 'RD'], 'Investigación de mercado local', 0.85, 'DO', 2025),
('precios', 'aplicaciones_moviles', 'Las apps móviles en RD cuestan entre RD$80,000 y RD$500,000 dependiendo de la complejidad. Apps híbridas son más económicas.', ARRAY['apps', 'móvil', 'precios', 'desarrollo'], 'Investigación de mercado local', 0.82, 'DO', 2025),
('mercado', 'tendencias_2025', 'Las principales tendencias tech en RD 2025: IA generativa, automatización, fintech, e-commerce y transformación digital empresarial.', ARRAY['tendencias', 'tecnología', 'mercado', '2025'], 'Análisis de mercado', 0.88, 'DO', 2025),
('tarifas', 'freelance_rates', 'Tarifas freelance en RD 2025: Junior $15-25/hora, Mid $25-45/hora, Senior $45-80/hora USD. Empresas cobran 30-50% más.', ARRAY['freelance', 'tarifas', 'desarrolladores', 'salarios'], 'Encuestas del sector', 0.80, 'DO', 2025),
('legal', 'contratos', 'En RD es recomendable usar contratos con ITBIS (18%), definir entregables claros y establecer cronograma de pagos.', ARRAY['legal', 'contratos', 'itbis', 'pagos'], 'Práctica legal local', 0.90, 'DO', 2025),
('economia', 'tasa_cambio', 'La tasa USD/DOP en 2025 fluctúa entre RD$58-62 por dólar. Se recomienda actualizar precios mensualmente.', ARRAY['dólar', 'peso', 'cambio', 'economía'], 'Banco Central RD', 0.95, 'DO', 2025),
('competencia', 'empresas_tech', 'Principales empresas tech en RD: GBH, Softtek, Claro RD, Pixelart, entre otras. La competencia ha aumentado significativamente.', ARRAY['empresas', 'competencia', 'tech', 'mercado'], 'Directorio empresarial', 0.75, 'DO', 2025),
('clientes', 'sectores_demanda', 'Sectores con mayor demanda tech en RD 2025: Banca y fintech, retail/e-commerce, turismo, salud y educación.', ARRAY['clientes', 'sectores', 'demanda', 'industrias'], 'Análisis sectorial', 0.85, 'DO', 2025);

-- Insert price research for Dominican Republic
INSERT INTO public.price_research (service_type, price_min_dop, price_max_dop, price_avg_dop, price_usd, region, research_source, is_verified) VALUES
('Landing Page Básica', 8000, 25000, 15000, 250, 'Santo Domingo', 'Cotizaciones locales', true),
('Sitio Web Corporativo', 25000, 80000, 50000, 833, 'Santo Domingo', 'Cotizaciones locales', true),
('E-commerce Básico', 50000, 150000, 100000, 1667, 'Santo Domingo', 'Cotizaciones locales', true),
('App Móvil Simple', 80000, 200000, 140000, 2333, 'Santo Domingo', 'Cotizaciones locales', true),
('Sistema a Medida', 100000, 500000, 250000, 4167, 'Santo Domingo', 'Cotizaciones locales', true),
('Mantenimiento Mensual', 5000, 25000, 12000, 200, 'Santo Domingo', 'Cotizaciones locales', true),
('Consultoría Tech (hora)', 1500, 5000, 3000, 50, 'Santo Domingo', 'Tarifas del mercado', true),
('Diseño UX/UI', 15000, 60000, 35000, 583, 'Santo Domingo', 'Cotizaciones locales', true);

-- Insert current exchange rate
INSERT INTO public.exchange_rates (currency_from, currency_to, rate, source) VALUES
('USD', 'DOP', 60.50, 'Banco Central RD');