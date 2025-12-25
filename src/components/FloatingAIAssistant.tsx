import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bot, X, Send, Loader, Plus, Brain, TrendingUp, Clock,
  Search, Zap, RefreshCw, Sparkles, MessageCircle, Target,
  DollarSign, BarChart3, Lightbulb, ChevronDown
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
import DOMPurify from "dompurify";
import { marked } from "marked";

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
  description?: string;
  estimatedHours?: number;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  // Parse module suggestions from AI response
  const parseModuleSuggestions = (content: string): ModuleSuggestion[] => {
    const suggestions: ModuleSuggestion[] = [];
    const regex = /\[MODULO_SUGERIDO\]([\s\S]*?)\[\/MODULO_SUGERIDO\]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const block = match[1];
      const nameMatch = block.match(/nombre:\s*"([^"]+)"/);
      const priceMatch = block.match(/precio:\s*(\d+)/);
      const descMatch = block.match(/descripcion:\s*"([^"]+)"/);
      const catMatch = block.match(/categoria:\s*"([^"]+)"/);
      const hoursMatch = block.match(/horasEstimadas:\s*(\d+)/);

      if (nameMatch && priceMatch) {
        suggestions.push({
          name: nameMatch[1],
          price: parseInt(priceMatch[1], 10),
          category: catMatch ? catMatch[1] : 'General',
          description: descMatch ? descMatch[1] : undefined,
          estimatedHours: hoursMatch ? parseInt(hoursMatch[1], 10) : undefined
        });
      }
    }
    return suggestions;
  };

  // Format markdown content to HTML
  const formatContent = (content: string): string => {
    const withoutModules = content.replace(/\[MODULO_SUGERIDO\][\s\S]*?\[\/MODULO_SUGERIDO\]/g, '');

    if (/<[^>]+>/.test(withoutModules)) {
      return DOMPurify.sanitize(withoutModules);
    }

    const html = marked.parse(withoutModules) as string;
    return DOMPurify.sanitize(html);
  };

  const handleQuery = async (type: QueryType, query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: query }]);

    try {
      const response = await expertSystem.query(type, query, getContext());
      const suggestions = parseModuleSuggestions(response.content);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content,
        suggestions: suggestions.length > 0 ? suggestions : response.moduleSuggestions,
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
        content: `<div class="bg-red-500/20 p-4 rounded-xl border border-red-500/30"><p class="text-red-300">⚠️ ${errorMessage}</p></div>`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedModule = (suggestion: ModuleSuggestion) => {
    const priceRD = suggestion.price < 1000 ? Math.round(suggestion.price * exchangeRate) : suggestion.price;
    onAddModule({
      name: suggestion.name,
      price: priceRD,
      description: suggestion.description || `${suggestion.category} - ${suggestion.estimatedHours ? suggestion.estimatedHours + 'h estimadas' : 'Módulo sugerido por IA'}`,
      category: suggestion.category
    });
    toast.success(`Módulo "${suggestion.name}" agregado (RD$${priceRD.toLocaleString()})`);
  };

  const quickActions = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Analizar Proyecto",
      description: "Análisis FODA completo",
      type: 'analyze' as QueryType,
      query: "Analiza el proyecto completo considerando el ciclo de vida del software",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Módulos Faltantes",
      description: "Sugerencias inteligentes",
      type: 'suggest_modules' as QueryType,
      query: "¿Qué módulos importantes me faltan para este proyecto? Incluye precios estimados en RD$",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Optimizar Precios",
      description: "Estrategias de pricing",
      type: 'optimize' as QueryType,
      query: "Optimiza los precios de la cotización para el mercado dominicano",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Timeline",
      description: "Cronograma de desarrollo",
      type: 'timeline' as QueryType,
      query: "Genera un cronograma detallado con fases SDLC",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Precios RD 2025",
      description: "Investigación de mercado",
      type: 'price_research' as QueryType,
      query: "Investiga precios del mercado dominicano 2025 para desarrollo web",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Infraestructura",
      description: "Vercel, dominio, hosting",
      type: 'compare' as QueryType,
      query: "¿Qué infraestructura necesito? Analiza opciones de Vercel, dominio y hosting para este proyecto",
      color: "from-cyan-500 to-sky-600"
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
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-webnova-500 to-webnova-600 hover:from-webnova-600 hover:to-webnova-700 shadow-2xl shadow-webnova-500/40 transform hover:scale-110 transition-all duration-300 group"
          size="lg"
        >
          <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:animate-pulse" />
        </Button>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
      </div>

      {/* AI Assistant Panel - Fullscreen on mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center">
          <Card className="bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl h-[95vh] sm:h-auto sm:max-h-[85vh] overflow-hidden border-0 flex flex-col">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-webnova-600 via-webnova-500 to-purple-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    Sistema Experto IA
                    <Sparkles className="w-4 h-4 text-webnova-200" />
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

            <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="w-full justify-start rounded-none border-b border-white/10 bg-gray-800/50 p-1 flex-shrink-0">
                  <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-webnova-500 data-[state=active]:text-white text-gray-400">
                    <MessageCircle className="w-4 h-4" />
                    Chat IA
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="flex items-center gap-2 data-[state=active]:bg-webnova-500 data-[state=active]:text-white text-gray-400">
                    <Zap className="w-4 h-4" />
                    Acciones
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="actions" className="flex-1 p-4 m-0 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={`h-auto py-4 px-3 flex flex-col items-center gap-2 bg-gray-800/50 border-white/10 hover:border-webnova-400/50 hover:bg-gray-700/50 transition-all group`}
                        onClick={() => {
                          setActiveTab("chat");
                          handleQuery(action.type, action.query);
                        }}
                        disabled={isLoading}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        <span className="font-semibold text-white text-sm text-center leading-tight">{action.title}</span>
                        <span className="text-xs text-gray-400 text-center">{action.description}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Context Info */}
                  <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-white/10">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-webnova-400" />
                      Contexto Actual
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Cliente:</span>
                        <p className="font-medium text-white">{clientName || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Proyecto:</span>
                        <p className="font-medium text-white">{projectType || 'No especificado'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Módulos ({selectedModules.length}):</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedModules.slice(0, 5).map((m, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-webnova-500/20 text-webnova-200 border-webnova-500/30">{m.name}</Badge>
                          ))}
                          {selectedModules.length > 5 && (
                            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">+{selectedModules.length - 5} más</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="flex-1 flex flex-col m-0 min-h-0">
                  {/* Messages Area - Using native scroll instead of ScrollArea for proper flex behavior */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-12 px-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-webnova-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                          <Brain className="w-8 h-8 text-webnova-400" />
                        </div>
                        <p className="text-lg font-medium text-white">Sistema Experto Listo</p>
                        <p className="text-sm mt-2 text-gray-400 max-w-sm mx-auto">
                          Describe tu proyecto y te ayudaré con módulos, estimaciones, precios y consideraciones de despliegue.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          <Badge className="bg-webnova-500/20 text-webnova-200 border-webnova-500/30">SDLC</Badge>
                          <Badge className="bg-webnova-500/20 text-webnova-200 border-webnova-500/30">Estimación</Badge>
                          <Badge className="bg-webnova-500/20 text-webnova-200 border-webnova-500/30">Vercel</Badge>
                          <Badge className="bg-webnova-500/20 text-webnova-200 border-webnova-500/30">Dominios</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {messages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                              ? 'bg-gradient-to-r from-webnova-500 to-webnova-600 text-white shadow-lg shadow-webnova-500/30'
                              : 'bg-gray-900/80 text-gray-100 border border-white/10 shadow-lg shadow-black/30 backdrop-blur'
                              }`}>
                              {msg.role === 'assistant' ? (
                                <>
                                  <div
                                    className="prose prose-sm prose-invert max-w-none leading-relaxed space-y-3 [&_p]:text-gray-200 [&_li]:text-gray-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-white [&_a]:text-webnova-300 [&_blockquote]:border-l-4 [&_blockquote]:border-webnova-500 [&_blockquote]:pl-4 [&_code]:text-amber-300 [&_table]:text-gray-200 [&_th]:text-white [&_td]:text-gray-200"
                                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                                  />

                                  {/* Module Suggestions */}
                                  {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                      <p className="text-sm font-semibold text-webnova-300 mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4" />
                                        Módulos Sugeridos:
                                      </p>
                                      <div className="space-y-2">
                                        {msg.suggestions.map((sug, i) => (
                                          <div key={i} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-white/10">
                                            <div className="flex-1 min-w-0 mr-3">
                                              <p className="font-medium text-white truncate">{sug.name}</p>
                                              <p className="text-xs text-gray-400">
                                                {sug.category} • RD${(sug.price < 1000 ? Math.round(sug.price * exchangeRate) : sug.price).toLocaleString()}
                                                {sug.estimatedHours && ` • ${sug.estimatedHours}h`}
                                              </p>
                                            </div>
                                            <Button
                                              size="sm"
                                              onClick={() => handleAddSuggestedModule(sug)}
                                              className="bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"
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
                                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3 text-xs text-gray-500">
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
                            <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-3 border border-white/10">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-webnova-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-webnova-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-webnova-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              <span className="text-gray-400">Analizando con IA...</span>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-white/10 bg-gray-900 flex-shrink-0">
                    <div className="flex gap-2">
                      <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe tu proyecto o pregunta sobre módulos, precios, infraestructura..."
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleQuery('general', prompt)}
                        className="flex-1 bg-gray-800 border-white/10 text-white placeholder:text-gray-500 focus:border-webnova-400"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={() => handleQuery('general', prompt)}
                        disabled={isLoading || !prompt.trim()}
                        className="bg-gradient-to-r from-webnova-500 to-webnova-600 hover:from-webnova-600 hover:to-webnova-700 shadow-lg shadow-webnova-500/25"
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
