import { User, ProjectorIcon as Project } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClientFormProps {
  clientName: string;
  projectType: string;
  onClientNameChange: (value: string) => void;
  onProjectTypeChange: (value: string) => void;
}

export const ClientForm = ({ 
  clientName, 
  projectType, 
  onClientNameChange, 
  onProjectTypeChange 
}: ClientFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-webnova-200 font-semibold flex items-center gap-2">
          <User className="w-4 h-4" />
          Cliente
        </Label>
        <Input
          type="text"
          placeholder="Nombre del cliente..."
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-webnova-500 focus:border-transparent transition-smooth font-medium"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-webnova-200 font-semibold flex items-center gap-2">
          <Project className="w-4 h-4" />
          Tipo de Proyecto
        </Label>
        <Input
          type="text"
          placeholder="Ej: Sitio de reservas..."
          value={projectType}
          onChange={(e) => onProjectTypeChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-webnova-500 focus:border-transparent transition-smooth font-medium"
        />
      </div>
    </div>
  );
};