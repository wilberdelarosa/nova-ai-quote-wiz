import { useState } from "react";
import { Edit, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Module } from "@/types/quotation";

interface ModuleCardProps {
  module: Module;
  isSelected: boolean;
  onToggleSelect: (moduleId: number) => void;
  onEdit: (module: Module) => void;
  onDelete: (moduleId: number) => void;
}

export const ModuleCard = ({
  module,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete
}: ModuleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    if (typeof window === 'undefined') return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este módulo?')) {
      onDelete(module.id);
    }
  };

  return (
    <Card
      className={`group relative glass hover-lift transition-all duration-300 ${isSelected
          ? 'ring-2 ring-webnova-500 ring-offset-2 ring-offset-background'
          : 'hover:border-webnova-400/40'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Module Header */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-webnova-200 transition-colors duration-200 leading-tight mb-1.5 break-words">
              {module.name}
            </h3>
            <p className="text-xl sm:text-2xl font-black text-webnova-300">
              RD$ {module.price.toLocaleString()}
            </p>
            {module.category && (
              <span className="inline-block mt-2 px-2.5 py-1 bg-webnova-500/20 text-webnova-200 text-xs font-semibold rounded-full">
                {module.category}
              </span>
            )}
          </div>

          {/* Action Buttons - Always visible on touch, hover on desktop */}
          <div className={`flex flex-col gap-1.5 transition-opacity duration-200 ${isHovered || isSelected ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
            }`}>
            <Button
              onClick={() => onEdit(module)}
              size="sm"
              className="p-2 h-8 w-8 bg-webnova-500/80 hover:bg-webnova-500 text-white rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              className="p-2 h-8 w-8 bg-red-500/80 hover:bg-red-500 text-white rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-300/90 leading-relaxed break-words line-clamp-2">
            {module.description}
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onToggleSelect(module.id)}
          className={`w-full py-2.5 sm:py-3 font-semibold shadow-md transition-all duration-200 active:scale-98 ${isSelected
              ? 'btn-danger'
              : 'btn-primary'
            }`}
        >
          {isSelected ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Remover
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </>
          )}
        </Button>

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-webnova-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg animate-pulse-glow">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};