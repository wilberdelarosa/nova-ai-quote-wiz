import { GROQ_MODELS, type Module, type AIAnalysis } from '../types/quotation';

const GROQ_API_KEY = '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';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  async callGroqAPI(messages: GroqMessage[], modelIndex: number = 0): Promise<string> {
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
          max_tokens: 2048,
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
    Eres un experto consultor de desarrollo web especializado en análisis de proyectos. Analiza este proyecto:
    
    Cliente: ${clientName}
    Tipo de Proyecto: ${projectType}
    Módulos seleccionados: ${selectedModules.map(m => `${m.name} - RD$${m.price} (${m.description})`).join(', ')}
    
    Proporciona un análisis completo en formato HTML con clases de Tailwind CSS que incluya:
    
    1. **Análisis del Proyecto** - Evaluación de la propuesta actual
    2. **Módulos Faltantes** - ¿Qué funcionalidades importantes podrían estar faltando?
    3. **Optimizaciones de Precio** - Sugerencias para mejorar el valor
    4. **Cronograma Sugerido** - Timeline realista de desarrollo
    5. **Consideraciones Técnicas** - Aspectos técnicos importantes
    6. **Recomendaciones Estratégicas** - Mejores prácticas para el éxito del proyecto
    
    Usa divs con clases como "bg-webnova-500/10 p-4 rounded-lg mb-4" para secciones.
    Usa iconos de texto como ⚡ 🚀 💡 ⏰ 🛠️ 📈 para hacer más visual.
    Sé específico y profesional, enfócate en valor empresarial.
    `;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'Eres un experto consultor en desarrollo web especializado en cotizaciones y análisis de proyectos. Siempre respondes en español y proporcionas recomendaciones prácticas y detalladas.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return await this.callGroqAPI(messages);
  }

  async optimizePricing(selectedModules: Module[], totalAmount: number): Promise<string> {
    const prompt = `
    Eres un experto en estrategia de precios para servicios de desarrollo web. Analiza esta cotización:
    
    Módulos seleccionados: ${selectedModules.map(m => `${m.name} - RD$${m.price}`).join(', ')}
    Total actual: RD$${totalAmount.toLocaleString()}
    
    Proporciona un análisis de optimización de precios en formato HTML con clases de Tailwind que incluya:
    
    1. **Análisis Competitivo** - ¿Están los precios bien posicionados?
    2. **Estrategias de Descuento** - Paquetes y ofertas recomendadas
    3. **Módulos Premium** - Funcionalidades adicionales de alto valor
    4. **Estructura de Pago** - Mejores opciones de financiamiento
    5. **Valor Añadido** - Servicios extra sin costo adicional
    6. **Propuesta de Valor** - Cómo justificar la inversión
    
    Conoces el mercado dominicano y latinoamericano.
    Sé estratégico y enfócate en maximizar el valor percibido.
    Usa iconos como 💰 📊 🎯 💳 🎁 🏆 para mejor presentación.
    `;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'Eres un experto en estrategia de precios para servicios de desarrollo web. Conoces el mercado dominicano y latinoamericano. Tus recomendaciones son estratégicas y orientadas a resultados.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return await this.callGroqAPI(messages);
  }

  async suggestMissingModules(projectType: string, selectedModules: Module[]): Promise<string> {
    const selectedNames = selectedModules.map(m => m.name).join(', ');
    
    const prompt = `
    Analiza este proyecto de tipo "${projectType}" y sugiere módulos adicionales importantes:
    
    Módulos ya seleccionados: ${selectedNames}
    
    Sugiere módulos faltantes que podrían ser críticos, con precios estimados en RD$.
    Proporciona la respuesta en formato HTML con clases de Tailwind.
    
    Para cada módulo sugerido incluye:
    - Nombre del módulo
    - Precio estimado en RD$
    - Descripción detallada
    - Por qué es importante para este tipo de proyecto
    
    Enfócate en funcionalidades que realmente agreguen valor.
    `;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'Eres un arquitecto de software especializado en proyectos web. Conoces qué módulos son esenciales para diferentes tipos de proyectos.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return await this.callGroqAPI(messages);
  }

  async evaluatePaymentGateway(projectType: string): Promise<string> {
    const prompt = `
    Proporciona un análisis detallado sobre pasarelas de pago para un proyecto de tipo "${projectType}" en República Dominicana:
    
    Incluye información sobre:
    1. **Azul (Banco Azul)** - Comisiones, integración, pros y contras
    2. **PayPal** - Comisiones internacionales, facilidad de uso
    3. **Stripe (si aplica)** - Disponibilidad en RD, comisiones
    4. **Transferencias bancarias** - Proceso manual, verificación
    5. **Comparativa de comisiones** - Tabla con porcentajes reales
    6. **Recomendación final** - Cuál conviene más y por qué
    
    Proporciona números reales de comisiones y detalles técnicos específicos.
    Respuesta en formato HTML con clases de Tailwind, tablas comparativas.
    `;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'Eres un experto en fintech y pasarelas de pago en República Dominicana y el Caribe. Conoces las comisiones actuales y procesos de integración.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return await this.callGroqAPI(messages);
  }

  async generateProjectTimeline(selectedModules: Module[]): Promise<string> {
    const moduleList = selectedModules.map(m => `${m.name} (${m.description})`).join(', ');
    
    const prompt = `
    Crea un cronograma detallado de desarrollo para este proyecto con los siguientes módulos:
    
    ${moduleList}
    
    Proporciona un timeline realista en formato HTML con clases de Tailwind que incluya:
    
    1. **Fases del proyecto** (Diseño, Desarrollo, Testing, Despliegue)
    2. **Duración estimada** de cada módulo
    3. **Dependencias** entre módulos
    4. **Entregables parciales** y milestones
    5. **Timeline visual** usando barras de progreso o similar
    6. **Consideraciones de riesgo** y buffers de tiempo
    
    Sé realista con los tiempos y considera la complejidad de cada módulo.
    Usa iconos como 📅 ⏱️ 🔄 ✅ ⚠️ para hacer más visual.
    `;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'Eres un project manager senior especializado en proyectos de desarrollo web. Tienes experiencia creando cronogramas realistas y gestionando expectativas.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return await this.callGroqAPI(messages);
  }
}