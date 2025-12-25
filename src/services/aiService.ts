import { GROQ_MODELS, type Module, type AIAnalysis } from '../types/quotation';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Expert system prompt with SDLC knowledge
const EXPERT_SYSTEM_PROMPT = `Eres un consultor experto en desarrollo de software con más de 15 años de experiencia.

## TU CONOCIMIENTO INCLUYE:

### Ciclo de Vida del Desarrollo de Software (SDLC)
- **Requisitos**: Levantamiento, documentación, casos de uso
- **Diseño**: UX/UI, arquitectura, base de datos
- **Desarrollo**: Frontend, Backend, APIs, integraciones
- **Pruebas**: QA, testing unitario, testing de integración
- **Despliegue**: Vercel, AWS, configuración de dominios, SSL
- **Mantenimiento**: Soporte, actualizaciones, monitoreo

### Estimación de Software
- Conoces metodologías como Function Point Analysis (FPA)
- Puedes estimar horas de desarrollo por complejidad
- Entiendes factores que afectan el tiempo: complejidad, dependencias, experiencia del equipo

### Infraestructura Web
- **Vercel**: Planes (Hobby, Pro, Enterprise), límites, pricing
- **Dominios**: Registro (.com, .do), DNS, propagación
- **SSL**: Let's Encrypt, certificados premium
- **CDN**: Cloudflare, optimización de assets

### Mercado Dominicano 2025
- Precios promedio de desarrollo web: RD$15,000 - RD$500,000+
- Tarifas por hora: RD$500 - RD$3,000
- Conoces el tipo de cambio USD/DOP (~60-63)

## FORMATO DE MÓDULOS SUGERIDOS

Cuando sugieras módulos nuevos, USA ESTE FORMATO EXACTO para que puedan ser parseados:

[MODULO_SUGERIDO]
nombre: "Nombre del Módulo"
precio: 15000
descripcion: "Descripción clara de qué incluye"
categoria: "Frontend|Backend|Diseño|Infraestructura|Testing|Mantenimiento"
horasEstimadas: 40
[/MODULO_SUGERIDO]

## REGLAS DE RESPUESTA
1. Responde SIEMPRE en español
2. Usa HTML con clases de Tailwind CSS para formato profesional
3. Usa fondos oscuros (bg-slate-800, bg-gray-900) con texto claro (text-white, text-gray-200)
4. Incluye emojis para mejor visualización: 🚀 💡 ⚡ 📊 🛠️ 🔒 💰
5. Sé específico con precios en RD$ (Pesos Dominicanos)
6. Considera siempre el contexto del proyecto al hacer recomendaciones`;

export class AIService {
  async callGroqAPI(messages: GroqMessage[], modelIndex: number = 0): Promise<string> {
      if (!GROQ_API_KEY) {
         throw new Error('Falta VITE_GROQ_API_KEY; mueve la clave al backend o configura la variable de entorno.');
      }
    if (modelIndex >= GROQ_MODELS.length) {
      throw new Error('Todos los modelos fallaron');
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODELS[modelIndex].name,
          messages: messages,
          temperature: 0.7,
          max_tokens: 3000,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Model ${GROQ_MODELS[modelIndex].displayName} failed:`, error);
      return await this.callGroqAPI(messages, modelIndex + 1);
    }
  }

  async analyzeProject(
    clientName: string,
    projectType: string,
    selectedModules: Module[]
  ): Promise<string> {
    const prompt = `
    Analiza este proyecto de desarrollo web considerando todo el ciclo de vida del software:
    
    ## CONTEXTO DEL PROYECTO
    - **Cliente**: ${clientName}
    - **Tipo de Proyecto**: ${projectType}
    - **Módulos seleccionados**: ${selectedModules.length > 0 ? selectedModules.map(m => `${m.name} - RD$${m.price.toLocaleString()}`).join(', ') : 'Ninguno'}
    - **Total actual**: RD$${selectedModules.reduce((sum, m) => sum + m.price, 0).toLocaleString()}
    
    ## PROPORCIONA:
    
    1. **🔍 Análisis FODA del Proyecto**
       - Fortalezas de la propuesta actual
       - Oportunidades de mejora
       - Debilidades identificadas
       - Amenazas o riesgos potenciales
    
    2. **📦 Módulos Faltantes Críticos**
       - Identifica qué funcionalidades importantes faltan
       - Para cada módulo faltante, usa el formato [MODULO_SUGERIDO] con precio y descripción
    
    3. **⏱️ Estimación de Tiempo por Fase SDLC**
       - Requisitos: X días
       - Diseño: X días
       - Desarrollo: X días
       - Testing: X días
       - Despliegue: X días
    
    4. **🌐 Consideraciones de Infraestructura**
       - Plan de Vercel recomendado
       - Necesidad de dominio
       - SSL y seguridad
       - CDN y optimización
    
    5. **💰 Evaluación del Precio Total**
       - ¿Es competitivo para el mercado RD?
       - Sugerencias de ajuste si aplica
    
    Formatea todo en HTML con clases de Tailwind. Usa fondos oscuros y texto claro.
    `;

    const messages: GroqMessage[] = [
      { role: 'system', content: EXPERT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callGroqAPI(messages);
  }

  async optimizePricing(selectedModules: Module[], totalAmount: number): Promise<string> {
    const prompt = `
    Analiza y optimiza esta cotización para el mercado dominicano:
    
    ## COTIZACIÓN ACTUAL
    ${selectedModules.map(m => `- ${m.name}: RD$${m.price.toLocaleString()}`).join('\n')}
    
    **Total**: RD$${totalAmount.toLocaleString()} (≈ US$${Math.round(totalAmount / 61).toLocaleString()})
    
    ## PROPORCIONA:
    
    1. **📊 Análisis de Precios por Módulo**
       - ¿Están bien posicionados vs. mercado RD?
       - Identifica módulos sub o sobre valorados
    
    2. **🎯 Estrategias de Pricing**
       - Paquetes con descuento
       - Opciones de financiamiento
       - Precio psicológico recomendado
    
    3. **💎 Valor Añadido Sin Costo**
       - Servicios extra para justificar el precio
       - Garantías y soporte incluido
    
    4. **📈 Módulos Premium Opcionales**
       - Funcionalidades adicionales de alto valor
       - Usa formato [MODULO_SUGERIDO] para cada uno
    
    5. **💳 Estructura de Pagos Recomendada**
       - Porcentaje inicial
       - Pagos por milestone
       - Política de cambios
    
    Formatea en HTML con Tailwind. Usa bg-slate-800/bg-gray-900 y texto claro.
    `;

    const messages: GroqMessage[] = [
      { role: 'system', content: EXPERT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callGroqAPI(messages);
  }

  async suggestMissingModules(projectType: string, selectedModules: Module[]): Promise<string> {
    const selectedNames = selectedModules.map(m => m.name).join(', ');

    const prompt = `
    Analiza este proyecto de tipo "${projectType}" y sugiere TODOS los módulos que podrían faltar:
    
    ## MÓDULOS YA SELECCIONADOS
    ${selectedNames || 'Ninguno'}
    
    ## PROPORCIONA:
    
    Para cada módulo sugerido, usa el formato exacto:
    
    [MODULO_SUGERIDO]
    nombre: "Nombre del Módulo"
    precio: XXXXX
    descripcion: "Descripción detallada"
    categoria: "Frontend|Backend|Diseño|Infraestructura|Testing|Mantenimiento"
    horasEstimadas: XX
    [/MODULO_SUGERIDO]
    
    ## CATEGORÍAS A CONSIDERAR:
    
    1. **Frontend Esencial**
       - Diseño responsivo, animaciones, componentes
    
    2. **Backend Crítico**
       - Autenticación, API, base de datos
    
    3. **Seguridad**
       - SSL, validación, protección de datos
    
    4. **SEO y Marketing**
       - Meta tags, sitemap, analytics
    
    5. **Infraestructura**
       - Hosting, dominio, CDN, backups
    
    6. **Mantenimiento**
       - Soporte, actualizaciones, monitoreo
    
    Sugiere al menos 5-8 módulos relevantes para este tipo de proyecto.
    `;

    const messages: GroqMessage[] = [
      { role: 'system', content: EXPERT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callGroqAPI(messages);
  }

  async evaluatePaymentGateway(projectType: string): Promise<string> {
    const prompt = `
    Proporciona un análisis COMPLETO sobre pasarelas de pago para "${projectType}" en República Dominicana:
    
    ## INCLUYE:
    
    1. **💳 Azul (Banco Azul)**
       - Comisiones actuales (%)
       - Requisitos de integración
       - Tiempo de acreditación
       - Pros y contras
    
    2. **🌐 PayPal**
       - Comisiones internacionales
       - Disponibilidad en RD
       - Facilidad de integración
    
    3. **💎 Stripe**
       - Disponibilidad en República Dominicana
       - Alternativas si no está disponible
    
    4. **🏦 Transferencias Bancarias**
       - Bancos principales (Popular, Reservas, BHD)
       - Proceso de verificación manual
    
    5. **📊 Tabla Comparativa**
       - Usa una tabla HTML con comisiones, tiempos, pros/contras
    
    6. **✅ Recomendación Final**
       - Cuál conviene más para este tipo de proyecto y por qué
       - Consideraciones de costos mensuales
    
    Formatea en HTML con Tailwind. Incluye tablas con bg-gray-800 y bordes sutiles.
    `;

    const messages: GroqMessage[] = [
      { role: 'system', content: EXPERT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callGroqAPI(messages);
  }

  async generateProjectTimeline(selectedModules: Module[]): Promise<string> {
    const moduleList = selectedModules.map(m => `${m.name} (${m.description || 'Sin descripción'})`).join(', ');
    const totalPrice = selectedModules.reduce((sum, m) => sum + m.price, 0);

    const prompt = `
    Crea un cronograma DETALLADO de desarrollo siguiendo metodología SDLC:
    
    ## MÓDULOS A DESARROLLAR
    ${moduleList}
    
    **Inversión Total**: RD$${totalPrice.toLocaleString()}
    
    ## ESTRUCTURA DEL CRONOGRAMA:
    
    1. **📋 Fase 1: Requisitos y Planificación**
       - Actividades específicas
       - Duración estimada
       - Entregables
    
    2. **🎨 Fase 2: Diseño UX/UI**
       - Wireframes
       - Mockups
       - Prototipo interactivo
       - Duración
    
    3. **💻 Fase 3: Desarrollo**
       - Desglose por módulo
       - Dependencias entre módulos
       - Duración por cada uno
    
    4. **🧪 Fase 4: Testing y QA**
       - Tipos de pruebas
       - Criterios de aceptación
    
    5. **🚀 Fase 5: Despliegue**
       - Configuración de Vercel/hosting
       - Dominio y DNS
       - SSL y seguridad
    
    6. **📊 Timeline Visual**
       - Usa barras de progreso HTML
       - Ejemplo: <div class="bg-gray-700 rounded-full h-4"><div class="bg-violet-500 h-4 rounded-full" style="width: 30%"></div></div>
    
    7. **⚠️ Riesgos y Buffers**
       - Riesgos identificados
       - Tiempo de contingencia recomendado
    
    Formatea en HTML con Tailwind. Usa iconos y colores para cada fase.
    `;

    const messages: GroqMessage[] = [
      { role: 'system', content: EXPERT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callGroqAPI(messages);
  }

  async analyzeInfrastructure(projectType: string, expectedTraffic: string = 'medio'): Promise<string> {
    const prompt = `
    Analiza las necesidades de infraestructura para un proyecto de "${projectType}":
    
    ## PROPORCIONA:
    
    1. **☁️ Hosting - Vercel**
       - Plan recomendado (Hobby/Pro/Enterprise)
       - Límites relevantes
       - Costo mensual estimado
    
    2. **🌐 Dominio**
       - Opciones (.com, .do, otros)
       - Registradores recomendados
       - Costo anual
    
    3. **🔒 SSL/Seguridad**
       - Let's Encrypt vs Premium
       - Headers de seguridad necesarios
    
    4. **⚡ CDN y Performance**
       - Cloudflare (free vs pro)
       - Optimización de imágenes
       - Caché recommendations
    
    5. **💾 Base de Datos**
       - Opciones (Supabase, PlanetScale, etc.)
       - Tier gratuito vs pago
    
    6. **📧 Email**
       - Opciones para email transaccional
       - Resend, SendGrid, etc.
    
    7. **💰 Costo Total Mensual**
       - Desglose por servicio
       - Total estimado en RD$
    
    Sugiere módulos de infraestructura usando formato [MODULO_SUGERIDO].
    `;

    const messages: GroqMessage[] = [
      { role: 'system', content: EXPERT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callGroqAPI(messages);
  }
}