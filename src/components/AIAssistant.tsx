import { useState } from "react";
import { Bot, Wand2, Calculator, Activity, Clock, DollarSign, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { expertSystem } from "@/services/expertSystemService";
import { Module } from "@/types/quotation";
import { useToast } from "@/hooks/use-toast";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface AIAssistantProps {
  clientName: string;
  projectType: string;
  selectedModules: Module[];
  totalAmount: number;
  onShowSuggestions: (content: string) => void;
}

export const AIAssistant = ({
  clientName,
  projectType,
  selectedModules,
  totalAmount,
  onShowSuggestions
}: AIAssistantProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isEvaluatingPayment, setIsEvaluatingPayment] = useState(false);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [isProcessingCustom, setIsProcessingCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const { toast } = useToast();

  const formatResponse = (response: string) => {
    const raw = /<[^>]+>/.test(response) ? response : marked.parse(response) as string;
    return DOMPurify.sanitize(raw);
  };

  const handleAnalyzeProject = async () => {
    if (!clientName.trim() || !projectType.trim()) {
      toast({
        title: "Información incompleta",
        description: "Por favor, completa la información del cliente y tipo de proyecto.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await expertSystem.analyzeProject(clientName, projectType, selectedModules);
      onShowSuggestions(formatResponse(analysis.content));
      toast({
        title: "Análisis completado",
        description: "El asistente IA ha analizado tu proyecto exitosamente.",
      });
    } catch (error) {
      console.error('Error analyzing project:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg border border-red-500/30"><p class="text-red-200">⚠️ Error al analizar el proyecto. Por favor, intenta de nuevo.</p></div>'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimizePricing = async () => {
    if (selectedModules.length === 0) {
      toast({
        title: "Sin módulos seleccionados",
        description: "Por favor, selecciona algunos módulos primero.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const optimization = await expertSystem.optimizePricing(selectedModules, totalAmount);
      onShowSuggestions(formatResponse(optimization.content));
      toast({
        title: "Optimización completada",
        description: "Se han generado recomendaciones de precio.",
      });
    } catch (error) {
      console.error('Error optimizing pricing:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg border border-red-500/30"><p class="text-red-200">⚠️ Error al optimizar precios. Por favor, intenta de nuevo.</p></div>'
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleEvaluatePaymentGateway = async () => {
    if (!projectType.trim()) {
      toast({
        title: "Tipo de proyecto requerido",
        description: "Por favor, especifica el tipo de proyecto primero.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluatingPayment(true);
    try {
      const evaluation = await expertSystem.compareOptions(
        `Compara pasarelas de pago para ${projectType}. Incluye comisiones reales en RD, pros/contras y recomendación.`
      );
      onShowSuggestions(formatResponse(evaluation.content));
      toast({
        title: "Análisis de pagos completado",
        description: "Se han evaluado las opciones de pasarela de pago.",
      });
    } catch (error) {
      console.error('Error evaluating payment gateway:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg border border-red-500/30"><p class="text-red-200">⚠️ Error al evaluar pasarelas de pago. Por favor, intenta de nuevo.</p></div>'
      );
    } finally {
      setIsEvaluatingPayment(false);
    }
  };

  const handleGenerateTimeline = async () => {
    if (selectedModules.length === 0) {
      toast({
        title: "Sin módulos seleccionados",
        description: "Por favor, selecciona algunos módulos para generar el cronograma.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTimeline(true);
    try {
      const timeline = await expertSystem.generateTimeline(selectedModules);
      onShowSuggestions(formatResponse(timeline.content));
      toast({
        title: "Cronograma generado",
        description: "Se ha creado un timeline detallado del proyecto.",
      });
    } catch (error) {
      console.error('Error generating timeline:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg border border-red-500/30"><p class="text-red-200">⚠️ Error al generar cronograma. Por favor, intenta de nuevo.</p></div>'
      );
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Prompt vacío",
        description: "Por favor, escribe una instrucción para la IA.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingCustom(true);
    try {
      const messages = [
        {
          role: 'system' as const,
          content: `Eres un experto consultor en desarrollo web especializado en cotizaciones y análisis de proyectos.
          
Tienes conocimiento profundo de:
- Ciclo de vida del desarrollo de software (SDLC)
- Metodologías de estimación (FPA, COCOMO)
- Despliegue en Vercel, configuración de dominios, SSL
- Precios del mercado de República Dominicana 2025

Cuando sugieras nuevos módulos, usa este formato exacto para que puedan ser parseados:
[MODULO_SUGERIDO]
nombre: "Nombre del Módulo"
precio: 5000
descripcion: "Descripción detallada"
categoria: "Frontend|Backend|Diseño|Infraestructura"
horasEstimadas: 40
[/MODULO_SUGERIDO]

Responde siempre en español con formato HTML y clases de Tailwind CSS para una presentación profesional.
Usa fondos oscuros con texto claro para mejor legibilidad (ej: bg-slate-800 text-white).`
        },
        {
          role: 'user' as const,
          content: `
            Contexto del proyecto:
            - Cliente: ${clientName || 'No especificado'}
            - Tipo de proyecto: ${projectType || 'No especificado'}
            - Módulos seleccionados: ${selectedModules.map(m => `${m.name} (RD$${m.price})`).join(', ') || 'Ninguno'}
            - Total actual: RD$${totalAmount.toLocaleString()}
            
            Instrucción específica: ${customPrompt}
            
            Proporciona una respuesta detallada y profesional en formato HTML con clases de Tailwind CSS.
            Usa colores oscuros para fondos y colores claros para texto.
          `
        }
      ];

      const response = await expertSystem.generalQuery(messages[messages.length - 1].content, {
        clientName,
        projectType,
        selectedModules,
        budget: totalAmount,
      });
      onShowSuggestions(formatResponse(response.content));
      setCustomPrompt("");
      toast({
        title: "Análisis personalizado completado",
        description: "La IA ha procesado tu solicitud exitosamente.",
      });
    } catch (error) {
      console.error('Error processing custom prompt:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg border border-red-500/30"><p class="text-red-200">⚠️ Error al procesar la solicitud. Por favor, intenta de nuevo.</p></div>'
      );
    } finally {
      setIsProcessingCustom(false);
    }
  };

  const quickActions = [
    {
      icon: <Wand2 className="w-4 h-4" />,
      label: "Analizar",
      onClick: handleAnalyzeProject,
      isLoading: isAnalyzing,
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: <Calculator className="w-4 h-4" />,
      label: "Precios",
      onClick: handleOptimizePricing,
      isLoading: isOptimizing,
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: "Pagos",
      onClick: handleEvaluatePaymentGateway,
      isLoading: isEvaluatingPayment,
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Timeline",
      onClick: handleGenerateTimeline,
      isLoading: isGeneratingTimeline,
      color: "from-blue-500 to-indigo-600"
    },
  ];

  return (
    <Card className="glass border-webnova-500/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-webnova-500 to-webnova-600 rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <span>Asistente IA</span>
          <Sparkles className="w-4 h-4 text-webnova-300 animate-pulse" />
          <div className="ml-auto w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Custom AI Prompt */}
        <div className="space-y-3">
          <Textarea
            placeholder="Describe tu proyecto y te sugeriré los módulos necesarios, estimaciones y consideraciones técnicas..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-webnova-400 transition-all duration-200 min-h-[80px] resize-none"
            rows={3}
          />
          <Button
            onClick={handleCustomPrompt}
            disabled={isProcessingCustom || !customPrompt.trim()}
            className="w-full bg-gradient-to-r from-webnova-500 to-webnova-600 hover:from-webnova-600 hover:to-webnova-700 text-white font-semibold shadow-lg shadow-webnova-500/25 transition-all duration-200 hover:shadow-webnova-500/40"
          >
            {isProcessingCustom ? (
              <Activity className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isProcessingCustom ? 'Analizando...' : 'Consultar IA'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <h4 className="text-white/80 font-medium text-sm flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Acciones Rápidas
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                disabled={action.isLoading}
                className={`bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm h-10`}
                size="sm"
              >
                {action.isLoading ? (
                  <Activity className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <span className="mr-1.5">{action.icon}</span>
                )}
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Context Summary */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-xs text-gray-400">
            <span className="text-webnova-300 font-medium">Contexto:</span>{" "}
            {clientName ? clientName : "Sin cliente"} • {projectType ? projectType : "Sin proyecto"} • {selectedModules.length} módulos
          </p>
        </div>
      </CardContent>
    </Card>
  );
};