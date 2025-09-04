import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Module } from "@/types/quotation";

interface ModuleManagerProps {
  onAddModule: (module: Omit<Module, 'id'>) => void;
  onEditModule: (moduleId: number, module: Omit<Module, 'id'>) => void;
  editingModule?: Module | null;
  onCancelEdit: () => void;
}

export const ModuleManager = ({ 
  onAddModule, 
  onEditModule,
  editingModule,
  onCancelEdit 
}: ModuleManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });

  const isEditing = !!editingModule;

  const handleOpen = () => {
    if (editingModule) {
      setFormData({
        name: editingModule.name,
        price: editingModule.price.toString(),
        description: editingModule.description,
        category: editingModule.category || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        description: '',
        category: ''
      });
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      name: '',
      price: '',
      description: '',
      category: ''
    });
    if (isEditing) {
      onCancelEdit();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const moduleData = {
      name: formData.name.trim(),
      price: parseInt(formData.price),
      description: formData.description.trim(),
      category: formData.category.trim() || undefined
    };

    if (isEditing && editingModule) {
      onEditModule(editingModule.id, moduleData);
    } else {
      onAddModule(moduleData);
    }

    handleClose();
  };

  // Open dialog automatically when editing
  React.useEffect(() => {
    if (editingModule) {
      handleOpen();
    }
  }, [editingModule]);

  return (
    <Dialog open={isOpen || !!editingModule} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleOpen}
          className="bg-gradient-primary hover:bg-gradient-secondary text-white font-bold shadow-lg transform hover:scale-105 transition-bounce flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Módulo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-white rounded-3xl shadow-elegant max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center justify-between">
            {isEditing ? 'Editar Módulo' : 'Nuevo Módulo'}
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Nombre del Módulo
            </Label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="focus:ring-webnova-500 focus:border-transparent transition-smooth"
              placeholder="Ej: Landing Page"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Precio (RD$)
            </Label>
            <Input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="focus:ring-webnova-500 focus:border-transparent transition-smooth"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Categoría (Opcional)
            </Label>
            <Input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="focus:ring-webnova-500 focus:border-transparent transition-smooth"
              placeholder="Ej: Frontend, Backend, Design"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Descripción
            </Label>
            <Textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada del módulo..."
              className="focus:ring-webnova-500 focus:border-transparent transition-smooth resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:bg-gradient-secondary text-white font-bold transition-smooth"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="flex-1 font-bold transition-smooth"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};