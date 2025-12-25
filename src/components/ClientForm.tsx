import { User, FolderKanban } from "lucide-react";
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
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label className="text-webnova-200 font-semibold flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          Cliente
        </Label>
        <Input
          type="text"
          placeholder="Nombre del cliente..."
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder-gray-400 hover:bg-white/15 focus:bg-white/15 hover:border-webnova-400/40 focus:ring-2 focus:ring-webnova-500/50 focus:border-webnova-400 transition-all duration-200 font-medium h-11"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-webnova-200 font-semibold flex items-center gap-2 text-sm">
          <FolderKanban className="w-4 h-4" />
          Tipo de Proyecto
        </Label>
        <Input
          type="text"
          placeholder="Ej: Sitio de reservas, E-commerce..."
          value={projectType}
          onChange={(e) => onProjectTypeChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder-gray-400 hover:bg-white/15 focus:bg-white/15 hover:border-webnova-400/40 focus:ring-2 focus:ring-webnova-500/50 focus:border-webnova-400 transition-all duration-200 font-medium h-11"
        />
      </div>
    </div>
  );
};