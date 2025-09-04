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
    if (window.confirm('¿Estás seguro de que deseas eliminar este módulo?')) {
      onDelete(module.id);
    }
  };

  return (
    <Card
      className="group relative bg-gradient-card hover-gradient backdrop-blur-lg border border-white/10 hover:border-webnova-400/50 shadow-card hover-3d transition-all duration-500"

      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        {/* Module Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-white group-hover:text-webnova-200 transition-colors duration-200 leading-tight mb-2 break-words">
              {module.name}
            </h3>
            <p className="text-2xl font-black text-webnova-300">
              RD$ {module.price.toLocaleString()}
            </p>
            {module.category && (
              <span className="inline-block mt-2 px-2 py-1 bg-webnova-500/20 text-webnova-100 text-xs font-semibold rounded-full">
                {module.category}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className={`flex flex-col gap-2 transition-opacity duration-200 ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              onClick={() => onEdit(module)}
              size="sm"
              className="p-2 bg-webnova-500 hover:bg-webnova-600 text-white rounded-full shadow-md transform hover:scale-110 hover:-translate-y-0.5 hover:rotate-6 transition-bounce"

            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transform hover:scale-110 hover:-translate-y-0.5 hover:rotate-6 transition-bounce"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-200 leading-relaxed break-words line-clamp-3">
            {module.description}
          </p>
        </div>
        
        {/* Action Button */}
        <Button
          onClick={() => onToggleSelect(module.id)}
          className={`w-full py-3 font-bold shadow-md hover:shadow-glow transform hover:scale-105 transition-bounce hover-gradient ${
            isSelected
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
              : 'bg-gradient-primary hover:bg-gradient-secondary text-white'
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
          <div className="absolute -top-2 -right-2 bg-webnova-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg animate-pulse">
            <Check className="w-4 h-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};