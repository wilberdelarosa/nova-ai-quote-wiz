import { useState } from "react";
import { Bot, Wand2, Calculator, Activity, Clock, DollarSign, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AIService } from "@/services/aiService";
import { Module } from "@/types/quotation";
import { useToast } from "@/hooks/use-toast";

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

  const aiService = new AIService();

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
      const analysis = await aiService.analyzeProject(clientName, projectType, selectedModules);
      onShowSuggestions(analysis);
      toast({
        title: "Análisis completado",
        description: "El asistente IA ha analizado tu proyecto exitosamente.",
      });
    } catch (error) {
      console.error('Error analyzing project:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg"><p><i class="fas fa-exclamation-triangle mr-2"></i>Error al analizar el proyecto. Por favor, intenta de nuevo.</p></div>'
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
      const optimization = await aiService.optimizePricing(selectedModules, totalAmount);
      onShowSuggestions(optimization);
      toast({
        title: "Optimización completada",
        description: "Se han generado recomendaciones de precio.",
      });
    } catch (error) {
      console.error('Error optimizing pricing:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg"><p>Error al optimizar precios. Por favor, intenta de nuevo.</p></div>'
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
      const evaluation = await aiService.evaluatePaymentGateway(projectType);
      onShowSuggestions(evaluation);
      toast({
        title: "Análisis de pagos completado",
        description: "Se han evaluado las opciones de pasarela de pago.",
      });
    } catch (error) {
      console.error('Error evaluating payment gateway:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg"><p>Error al evaluar pasarelas de pago. Por favor, intenta de nuevo.</p></div>'
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
      const timeline = await aiService.generateProjectTimeline(selectedModules);
      onShowSuggestions(timeline);
      toast({
        title: "Cronograma generado",
        description: "Se ha creado un timeline detallado del proyecto.",
      });
    } catch (error) {
      console.error('Error generating timeline:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg"><p>Error al generar cronograma. Por favor, intenta de nuevo.</p></div>'
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
          content: 'Eres un experto consultor en desarrollo web especializado en cotizaciones y análisis de proyectos. Responde siempre en español con formato HTML y clases de Tailwind CSS para una presentación profesional.'
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
          `
        }
      ];

      const response = await aiService.callGroqAPI(messages);
      onShowSuggestions(response);
      setCustomPrompt("");
      toast({
        title: "Análisis personalizado completado",
        description: "La IA ha procesado tu solicitud exitosamente.",
      });
    } catch (error) {
      console.error('Error processing custom prompt:', error);
      onShowSuggestions(
        '<div class="bg-red-500/20 p-4 rounded-lg"><p>Error al procesar la solicitud. Por favor, intenta de nuevo.</p></div>'
      );
    } finally {
      setIsProcessingCustom(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white font-bold flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Asistente IA
          <div className="ml-auto w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom AI Prompt */}
        <div className="space-y-2">
          <Textarea
            placeholder="Escribe una instrucción personalizada para la IA (ej: 'Sugiere módulos adicionales para e-commerce', 'Analiza riesgos del proyecto', etc.)"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 transition-all duration-200"
            rows={3}
          />
          <Button 
            onClick={handleCustomPrompt}
            disabled={isProcessingCustom || !customPrompt.trim()}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-bold transition-smooth"
            variant="secondary"
          >
            {isProcessingCustom ? (
              <Activity className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isProcessingCustom ? 'Procesando...' : 'Consultar IA'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-white/20 pt-4 space-y-2">
          <h4 className="text-white font-semibold text-sm">Acciones Rápidas:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleAnalyzeProject}
              disabled={isAnalyzing}
              className="bg-white/20 hover:bg-white/30 text-white font-bold transition-smooth text-xs"
              variant="secondary"
              size="sm"
            >
              {isAnalyzing ? (
                <Activity className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3 mr-1" />
              )}
              Analizar
            </Button>
            
            <Button 
              onClick={handleOptimizePricing}
              disabled={isOptimizing}
              className="bg-white/20 hover:bg-white/30 text-white font-bold transition-smooth text-xs"
              variant="secondary"
              size="sm"
            >
              {isOptimizing ? (
                <Activity className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Calculator className="w-3 h-3 mr-1" />
              )}
              Precios
            </Button>

            <Button 
              onClick={handleEvaluatePaymentGateway}
              disabled={isEvaluatingPayment}
              className="bg-white/20 hover:bg-white/30 text-white font-bold transition-smooth text-xs"
              variant="secondary"
              size="sm"
            >
              {isEvaluatingPayment ? (
                <Activity className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <DollarSign className="w-3 h-3 mr-1" />
              )}
              Pagos
            </Button>

            <Button 
              onClick={handleGenerateTimeline}
              disabled={isGeneratingTimeline}
              className="bg-white/20 hover:bg-white/30 text-white font-bold transition-smooth text-xs"
              variant="secondary"
              size="sm"
            >
              {isGeneratingTimeline ? (
                <Activity className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Clock className="w-3 h-3 mr-1" />
              )}
              Timeline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};