import { TrendingUp, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Module } from "@/types/quotation";

interface ProjectSummaryProps {
  selectedModules: Module[];
  totalAmount: number;
  usdRate: number;
  onRemoveModule: (moduleId: number) => void;
}

export const ProjectSummary = ({
  selectedModules,
  totalAmount,
  usdRate,
  onRemoveModule
}: ProjectSummaryProps) => {
  if (selectedModules.length === 0) {
    return (
      <Card className="bg-gradient-card rounded-3xl border-white/10 shadow-elegant backdrop-blur-sm animate-glow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-webnova-400" />
              Resumen del Proyecto
            </h2>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="text-center text-gray-400 py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-600/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-lg">No hay módulos seleccionados</p>
            <p className="text-sm text-gray-500 mt-2">Selecciona módulos para ver el resumen</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-primary rounded-2xl">
            <p className="text-sm text-webnova-100 mb-2">Total del Proyecto</p>
            <p className="text-4xl font-black text-white">RD$ 0</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card rounded-3xl border-white/10 shadow-elegant backdrop-blur-sm animate-glow">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-webnova-400" />
            Resumen del Proyecto
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-4 mb-8">
          {selectedModules.map((module) => (
            <div
              key={module.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 gap-4 hover:bg-white/15 transition-colors duration-200"
            >
              <div className="flex-1">
                <h4 className="font-bold text-white text-lg break-words">
                  {module.name}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed mt-1 break-words">
                  {module.description}
                </p>
                {module.category && (
                  <span className="inline-block mt-2 px-2 py-1 bg-webnova-500/20 text-webnova-200 text-xs font-semibold rounded-full">
                    {module.category}
                  </span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-webnova-300">
                  RD$ {module.price.toLocaleString()}
                </p>
                <Button
                  onClick={() => onRemoveModule(module.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 text-sm mt-2 flex items-center gap-1 hover:bg-red-500/10"
                >
                  <X className="w-3 h-3" />
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center p-6 bg-gradient-primary rounded-2xl">
          <p className="text-sm text-webnova-100 mb-2">Total del Proyecto</p>
          <p className="text-4xl font-black text-white">
            RD$ {totalAmount.toLocaleString()}
          </p>
          <p className="text-sm text-webnova-100 mt-2">
            ≈ US$ {usdRate ? Math.round(totalAmount / usdRate) : '...'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};