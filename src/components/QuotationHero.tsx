import { Brain, Sparkles } from "lucide-react";

export const QuotationHero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-6 py-16 text-center">
        <div className="animate-float mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full backdrop-blur-sm">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
          WebNova<span className="text-webnova-200">Lab</span> 
          <span className="text-2xl ml-2 inline-flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            AI
          </span>
        </h1>
        <p className="text-xl text-webnova-100 max-w-2xl mx-auto leading-relaxed">
          Cotizador Profesional con Inteligencia Artificial
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <div className="h-2 w-2 bg-webnova-200 rounded-full animate-pulse"></div>
          <div 
            className="h-2 w-2 bg-webnova-300 rounded-full animate-pulse" 
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div 
            className="h-2 w-2 bg-webnova-400 rounded-full animate-pulse" 
            style={{ animationDelay: '1s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};