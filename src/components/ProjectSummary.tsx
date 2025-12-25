import { TrendingUp, X, RefreshCw, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Module } from "@/types/quotation";

interface ProjectSummaryProps {
  selectedModules: Module[];
  totalAmount: number;
  usdRate: number;
  isLoadingRate?: boolean;
  lastUpdated?: Date | null;
  onUpdateRate?: () => void;
  onRemoveModule: (moduleId: number) => void;
}

export const ProjectSummary = ({
  selectedModules,
  totalAmount,
  usdRate,
  isLoadingRate,
  lastUpdated,
  onUpdateRate,
  onRemoveModule
}: ProjectSummaryProps) => {
  if (selectedModules.length === 0) {
    return (
      <Card className="glass rounded-2xl sm:rounded-3xl border-white/10 shadow-card">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2 sm:gap-3">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-webnova-400" />
              Resumen del Proyecto
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-webnova-500 to-webnova-600 mx-auto rounded-full"></div>
          </div>

          <div className="text-center text-gray-400 py-6 sm:py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-600/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
            </div>
            <p className="text-base sm:text-lg">No hay módulos seleccionados</p>
            <p className="text-sm text-gray-500 mt-2">Selecciona módulos para ver el resumen</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-webnova-600 to-webnova-700 rounded-xl sm:rounded-2xl">
            <p className="text-xs sm:text-sm text-webnova-100 mb-1 sm:mb-2">Total del Proyecto</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">RD$ 0</p>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-webnova-100/80 mt-2">
              <span>≈ US$ 0</span>
              {onUpdateRate && (
                <Button
                  onClick={onUpdateRate}
                  disabled={isLoadingRate}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-webnova-100/80 hover:text-white hover:bg-white/10"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingRate ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass rounded-2xl sm:rounded-3xl border-white/10 shadow-card">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-webnova-400" />
            Resumen del Proyecto
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-webnova-500 to-webnova-600 mx-auto rounded-full"></div>
        </div>

        {/* Module List - Responsive */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {selectedModules.map((module) => (
            <div
              key={module.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 hover:bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/10 gap-3 transition-colors duration-200"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base sm:text-lg break-words">
                  {module.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-0.5 break-words line-clamp-2">
                  {module.description}
                </p>
                {module.category && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-webnova-500/20 text-webnova-200 text-xs font-medium rounded-full">
                    {module.category}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4 flex-shrink-0">
                <p className="text-lg sm:text-xl font-bold text-webnova-300">
                  RD$ {module.price.toLocaleString()}
                </p>
                <Button
                  onClick={() => onRemoveModule(module.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 text-xs sm:text-sm flex items-center gap-1 hover:bg-red-500/10 px-2 sm:px-3"
                >
                  <X className="w-3 h-3" />
                  <span className="hidden xs:inline">Remover</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Total Section */}
        <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-webnova-600 to-webnova-700 rounded-xl sm:rounded-2xl">
          <p className="text-xs sm:text-sm text-webnova-100 mb-1 sm:mb-2">Total del Proyecto</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            RD$ {totalAmount.toLocaleString()}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-webnova-100/80 mt-2">
            <span>≈ US$ {usdRate ? Math.round(totalAmount / usdRate).toLocaleString() : '...'}</span>
            {onUpdateRate && (
              <Button
                onClick={onUpdateRate}
                disabled={isLoadingRate}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-webnova-100/80 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRate ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          {lastUpdated && (
            <div className="flex items-center justify-center gap-1 text-xs text-webnova-100/60 mt-1">
              <Clock className="w-3 h-3" />
              <span>Actualizado: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};