export interface Module {
  id: number;
  name: string;
  price: number;
  description: string;
  category?: string;
  estimatedHours?: number;
}

export interface QuotationData {
  client: string;
  projectType: string;
  modules: Module[];
  selected: number[];
  timestamp: string;
  version: string;
  totalAmount?: number;
  paymentTerms?: string;
  estimatedDelivery?: string;
}

export interface AIAnalysis {
  analysis: string;
  recommendations: string[];
  missingModules: Module[];
  priceOptimizations: string[];
  timeline: string;
  technicalConsiderations: string[];
}

export interface AIModel {
  name: string;
  displayName: string;
  description: string;
}

export const GROQ_MODELS: AIModel[] = [
  { name: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B', description: 'Modelo más potente' },
  { name: 'llama-3.1-70b-versatile', displayName: 'Llama 3.1 70B', description: 'Muy potente y confiable' },
  { name: 'mixtral-8x7b-32768', displayName: 'Mixtral 8x7B', description: 'Excelente para análisis' },
  { name: 'llama-3.1-8b-instant', displayName: 'Llama 3.1 8B', description: 'Rápido y eficiente' },
  { name: 'gemma2-9b-it', displayName: 'Gemma2 9B', description: 'Modelo de respaldo' }
];

export const DEFAULT_MODULES: Module[] = [
  { id: 1, name: "Landing Page", price: 3500, description: "Sección de inicio con branding y botón de WhatsApp", category: "Frontend" },
  { id: 2, name: "Diseño Responsivo", price: 3500, description: "Adaptación para móviles, tablets y escritorio", category: "Design" },
  { id: 3, name: "Catálogo de Vehículos", price: 4000, description: "Listado de vehículos con filtros y ficha de detalles", category: "Frontend" },
  { id: 4, name: "Reserva (Formulario)", price: 5000, description: "Formulario con datos del cliente, fechas y lugares", category: "Frontend" },
  { id: 5, name: "Soporte Multilingüe", price: 2000, description: "Interfaz en Español, Inglés y Francés", category: "Frontend" },
  { id: 6, name: "Hosting + Dominio", price: 2000, description: "Configuración en Vercel + dominio personalizado", category: "Infrastructure" },
  { id: 7, name: "Pasarela de Pago", price: 18000, description: "Integración con Azul, PayPal y opciones de transferencia", category: "Backend" },
  { id: 8, name: "Gestión de Precios y Descuentos", price: 13000, description: "Lógica de mínimo 3 días, descuentos, seguro e impuestos", category: "Backend" },
  { id: 9, name: "Notificaciones y WhatsApp", price: 7000, description: "Confirmaciones por correo y WhatsApp, cláusulas de responsabilidad", category: "Integration" },
  { id: 10, name: "Panel de Administración", price: 10000, description: "Gestión de reservas, clientes y sincronización con Google Calendar", category: "Backend" },
  { id: 11, name: "SEO y Publicidad", price: 6000, description: "Optimización SEO y preparación para campañas digitales", category: "Marketing" },
  { id: 12, name: "Branding y Diseño", price: 8000, description: "Logo, colores corporativos, diseño gráfico y estilos", category: "Design" },
  { id: 13, name: "Inventario Futuro", price: 9000, description: "Módulo adicional para gestión de inventario de vehículos", category: "Backend" },
  { id: 14, name: "Control de Usuario (Futuro)", price: 12000, description: "Sistema de login, roles y clientes registrados", category: "Backend" }
];

export const USD_RATE = 60; // 1 USD = 60 RD$