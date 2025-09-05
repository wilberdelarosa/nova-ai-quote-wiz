import { useState } from "react";
import { Bot, MessageCircle, X, Send, Loader, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AIService } from "@/services/aiService";
import { Module } from "@/types/quotation";
import { toast } from "sonner";

interface FloatingAIAssistantProps {
  modules: Module[];
  selectedModules: Module[];
  onAddModule: (module: Omit<Module, 'id'>) => void;
  clientName: string;
  projectType: string;
}

export const FloatingAIAssistant = ({
  modules, 
  selectedModules, 
  onAddModule,
  clientName,
  projectType
}: FloatingAIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  type SuggestedModule = Omit<Module, 'id'>;
  const [suggestions, setSuggestions] = useState<SuggestedModule[]>([]);
  const [lastResponse, setLastResponse] = useState("");

  const aiService = new AIService();

  const handlePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const context = `
        Cliente: ${clientName}
        Proyecto: ${projectType}
        Módulos disponibles: ${modules.map(m => `${m.name} - RD$${m.price}`).join(', ')}
        Módulos seleccionados: ${selectedModules.map(m => `${m.name} - RD$${m.price}`).join(', ')}
      `;

      const systemPrompt = `
        Eres un asistente AI especializado en cotizaciones de desarrollo web. Tu trabajo es:
        1. Analizar el proyecto actual y sugerir mejoras
        2. Sugerir módulos faltantes específicos con precio y descripción exactos
        3. Responder preguntas sobre el proyecto
        4. Optimizar precios y estrategias
        
        IMPORTANTE: Si sugieres nuevos módulos, usa este formato exacto:
        <div class="module-suggestion bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <h4 class="text-green-800 font-bold">MÓDULO SUGERIDO</h4>
          <p class="text-green-700"><strong>Nombre:</strong> [nombre exacto]</p>
          <p class="text-green-700"><strong>Precio:</strong> [precio en RD$]</p>
          <p class="text-green-700"><strong>Descripción:</strong> [descripción detallada]</p>
          <button class="add-module-btn bg-green-600 text-white px-3 py-1 rounded text-sm mt-2" 
                  data-name="[nombre]" 
                  data-price="[precio sin RD$]" 
                  data-description="[descripción]">
            Agregar Módulo
          </button>
        </div>
        
        Responde en HTML limpio sin markdown. Usa texto oscuro en fondos claros para buen contraste.
      `;

      const response = await aiService.callGroqAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${context}\n\nPregunta del usuario: ${prompt}` }
      ]);

      setLastResponse(response);
      extractModuleSuggestions(response);
      setPrompt("");
    } catch (error) {
      toast.error("Error al procesar la solicitud");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractModuleSuggestions = (response: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = response;
    const moduleButtons = tempDiv.querySelectorAll('.add-module-btn');
    
    const newSuggestions: SuggestedModule[] = [];
    moduleButtons.forEach(btn => {
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      const description = btn.getAttribute('data-description');
      
      if (name && price && description) {
        newSuggestions.push({
          name,
          price: parseInt(price),
          description
        });
      }
    });
    
    setSuggestions(newSuggestions);
  };

  const handleAddSuggestedModule = (module: SuggestedModule) => {
    onAddModule({
      name: module.name,
      price: module.price,
      description: module.description
    });
    toast.success(`Módulo "${module.name}" agregado exitosamente`);
  };

  const quickActions = [
    {
      title: "Analizar Módulos Faltantes",
      prompt: "¿Qué módulos importantes me faltan para este tipo de proyecto? Sugiere módulos específicos con precios."
    },
    {
      title: "Optimizar Precios",
      prompt: "Analiza los precios actuales y sugiere optimizaciones o descuentos estratégicos."
    },
    {
      title: "Evaluar Pasarelas de Pago",
      prompt: "¿Qué pasarela de pago conviene más para este proyecto en República Dominicana? Incluye comisiones."
    },
    {
      title: "Cronograma de Desarrollo",
      prompt: "Crea un cronograma detallado de desarrollo para los módulos seleccionados."
    }
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg transform hover:scale-105 transition-all duration-200"
          size="lg"
        >
          <Bot className="w-8 h-8 text-white" />
        </Button>
      </div>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <Card className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b bg-gradient-to-r from-purple-500 to-blue-500">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Bot className="w-6 h-6" />
                Asistente AI Avanzado
              </CardTitle>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Quick Actions */}
              <div className="p-4 border-b bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Acciones Rápidas:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 px-3 hover:bg-purple-50"
                      onClick={() => setPrompt(action.prompt)}
                    >
                      {action.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Response Area */}
              <div className="h-96 overflow-auto p-4">
                {lastResponse ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: lastResponse }}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Haz una pregunta o usa las acciones rápidas para comenzar</p>
                  </div>
                )}
              </div>

              {/* Suggested Modules */}
              {suggestions.length > 0 && (
                <div className="p-4 border-t bg-green-50">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Módulos Sugeridos:</h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                        <div>
                          <p className="font-semibold text-gray-800">{suggestion.name}</p>
                          <p className="text-sm text-gray-600">RD$ {suggestion.price.toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddSuggestedModule(suggestion)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Pregúntame sobre el proyecto, módulos faltantes, precios..."
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handlePrompt()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handlePrompt}
                    disabled={isLoading || !prompt.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};