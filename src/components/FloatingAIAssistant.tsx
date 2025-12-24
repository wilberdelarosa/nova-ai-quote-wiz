import { useState, useEffect, useCallback } from "react";
import { 
  Bot, X, Send, Loader, Plus, Brain, TrendingUp, Clock, 
  Search, Zap, RefreshCw, Sparkles, MessageCircle, Target,
  DollarSign, BarChart3, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { expertSystem, type QueryType, type ExpertContext } from "@/services/expertSystemService";
import { db } from "@/services/databaseService";
import { Module } from "@/types/quotation";
import { toast } from "sonner";

interface FloatingAIAssistantProps {
  modules: Module[];
  selectedModules: Module[];
  onAddModule: (module: Omit<Module, 'id'>) => void;
  clientName: string;
  projectType: string;
}

interface ModuleSuggestion {
  name: string;
  price: number;
  category: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: ModuleSuggestion[];
  metadata?: {
    type: QueryType;
    processingTime: number;
    exchangeRate: number;
  };
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(60.50);
  const [activeTab, setActiveTab] = useState("chat");

  // Load exchange rate on mount
  useEffect(() => {
    const loadRate = async () => {
      try {
        const rate = await db.getLatestExchangeRate();
        setExchangeRate(rate);
      } catch (e) {
        console.warn('Could not load exchange rate');
      }
    };
    loadRate();
  }, []);

  const getContext = useCallback((): ExpertContext => ({
    projectType,
    clientName,
    selectedModules,
  }), [projectType, clientName, selectedModules]);

  const handleQuery = async (type: QueryType, query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    
    try {
      const response = await expertSystem.query(type, query, getContext());
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.content,
        suggestions: response.moduleSuggestions,
        metadata: response.metadata
      }]);
      
      if (response.metadata?.exchangeRate) {
        setExchangeRate(response.metadata.exchangeRate);
      }
      
      setPrompt("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error del sistema experto';
      toast.error(errorMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `<div class="text-red-600 p-4 bg-red-50 rounded-lg">Error: ${errorMessage}</div>`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedModule = (suggestion: ModuleSuggestion) => {
    const priceRD = Math.round(suggestion.price * exchangeRate);
    onAddModule({
      name: suggestion.name,
      price: priceRD,
      description: `${suggestion.category} - $${suggestion.price} USD`
    });
    toast.success(`Módulo "${suggestion.name}" agregado (RD$${priceRD.toLocaleString()})`);
  };

  const quickActions = [
    {
      icon: <Target className="w-4 h-4" />,
      title: "Analizar Proyecto",
      description: "Análisis FODA completo",
      type: 'analyze' as QueryType,
      query: "Analiza el proyecto completo"
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Módulos Faltantes",
      description: "Sugerencias inteligentes",
      type: 'suggest_modules' as QueryType,
      query: "¿Qué módulos importantes me faltan?"
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      title: "Optimizar Precios",
      description: "Estrategias de pricing",
      type: 'optimize' as QueryType,
      query: "Optimiza los precios de la cotización"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Timeline",
      description: "Cronograma de desarrollo",
      type: 'timeline' as QueryType,
      query: "Genera un cronograma detallado"
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      title: "Precios RD 2025",
      description: "Investigación de mercado",
      type: 'price_research' as QueryType,
      query: "Investiga precios del mercado dominicano para desarrollo web"
    },
    {
      icon: <Search className="w-4 h-4" />,
      title: "Comparar Opciones",
      description: "Análisis comparativo",
      type: 'compare' as QueryType,
      query: "Compara las diferentes opciones de tecnología para este proyecto"
    }
  ];

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-2xl transform hover:scale-110 transition-all duration-300 group"
          size="lg"
        >
          <Brain className="w-8 h-8 text-white group-hover:animate-pulse" />
        </Button>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
      </div>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <Card className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-0">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    Sistema Experto IA
                    <Sparkles className="w-4 h-4" />
                  </CardTitle>
                  <p className="text-white/70 text-xs">Mercado Dominicano 2025 • USD/DOP: {exchangeRate.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/20"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex flex-col h-[70vh]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 p-1">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat IA
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Acciones
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="actions" className="flex-1 p-4 m-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-violet-50 hover:border-violet-300 transition-all group"
                        onClick={() => {
                          setActiveTab("chat");
                          handleQuery(action.type, action.query);
                        }}
                        disabled={isLoading}
                      >
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:bg-violet-200 transition-colors">
                          {action.icon}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{action.title}</span>
                        <span className="text-xs text-gray-500">{action.description}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Context Info */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Contexto Actual
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Cliente:</span>
                        <p className="font-medium text-gray-800">{clientName || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Proyecto:</span>
                        <p className="font-medium text-gray-800">{projectType || 'No especificado'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Módulos ({selectedModules.length}):</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedModules.slice(0, 5).map((m, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{m.name}</Badge>
                          ))}
                          {selectedModules.length > 5 && (
                            <Badge variant="outline" className="text-xs">+{selectedModules.length - 5} más</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-12">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Sistema Experto Listo</p>
                        <p className="text-sm mt-2">Pregunta sobre precios en RD, módulos, optimización o cualquier aspecto del proyecto</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 ${
                              msg.role === 'user' 
                                ? 'bg-violet-600 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {msg.role === 'assistant' ? (
                                <>
                                  <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: msg.content }}
                                  />
                                  
                                  {/* Module Suggestions */}
                                  {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <p className="text-sm font-semibold text-gray-700 mb-2">Módulos Sugeridos:</p>
                                      <div className="space-y-2">
                                        {msg.suggestions.map((sug, i) => (
                                          <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                            <div>
                                              <p className="font-medium text-gray-800">{sug.name}</p>
                                              <p className="text-xs text-gray-500">
                                                ${sug.price} USD • RD${Math.round(sug.price * exchangeRate).toLocaleString()}
                                              </p>
                                            </div>
                                            <Button
                                              size="sm"
                                              onClick={() => handleAddSuggestedModule(sug)}
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
                                  
                                  {/* Metadata */}
                                  {msg.metadata && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-3 text-xs text-gray-500">
                                      <span>⏱️ {msg.metadata.processingTime}ms</span>
                                      <span>💱 RD${msg.metadata.exchangeRate}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p>{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl p-4 flex items-center gap-3">
                              <Loader className="w-5 h-5 animate-spin text-violet-600" />
                              <span className="text-gray-600">Analizando con IA...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                      <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Pregunta sobre precios RD, módulos, estrategias..."
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleQuery('general', prompt)}
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={() => handleQuery('general', prompt)}
                        disabled={isLoading || !prompt.trim()}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
