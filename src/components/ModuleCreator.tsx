import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Module } from "@/types/quotation";

interface ModuleCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateModule: (module: Omit<Module, 'id'>) => void;
  suggestedModule?: {
    name: string;
    price: number;
    description: string;
  } | null;
}

export const ModuleCreator = ({ 
  isOpen, 
  onClose, 
  onCreateModule, 
  suggestedModule 
}: ModuleCreatorProps) => {
  const [name, setName] = useState(suggestedModule?.name || "");
  const [price, setPrice] = useState(suggestedModule?.price || 0);
  const [description, setDescription] = useState(suggestedModule?.description || "");

  useEffect(() => {
    setName(suggestedModule?.name || "");
    setPrice(suggestedModule?.price || 0);
    setDescription(suggestedModule?.description || "");
  }, [suggestedModule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !description.trim()) return;

    onCreateModule({
      name: name.trim(),
      price,
      description: description.trim(),
      category: "Personalizado"
    });

    // Reset form
    setName("");
    setPrice(0);
    setDescription("");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setPrice(0);
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {suggestedModule ? "Agregar Módulo Sugerido" : "Crear Nuevo Módulo"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module-name">Nombre del Módulo</Label>
            <Input
              id="module-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del módulo..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="module-price">Precio (RD$)</Label>
            <Input
              id="module-price"
              type="number"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="0"
              min="0"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="module-description">Descripción</Label>
            <Textarea
              id="module-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada del módulo..."
              rows={3}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Crear Módulo
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};