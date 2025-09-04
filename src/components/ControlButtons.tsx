import { FileText, Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFService } from "@/services/pdfService";
import { Module, QuotationData } from "@/types/quotation";
import { useToast } from "@/hooks/use-toast";

interface ControlButtonsProps {
  clientName: string;
  projectType: string;
  modules: Module[];
  selectedModules: Module[];
  totalAmount: number;
  onImportData: (data: QuotationData) => void;
  onClearSelection: () => void;
}

export const ControlButtons = ({ 
  clientName,
  projectType,
  modules,
  selectedModules,
  totalAmount,
  onImportData,
  onClearSelection
}: ControlButtonsProps) => {
  const { toast } = useToast();
  const pdfService = new PDFService();

  const handleGeneratePDF = async () => {
    try {
      await pdfService.generateProfessionalPDF(
        clientName,
        projectType,
        selectedModules,
        totalAmount
      );
      toast({
        title: "PDF generado exitosamente",
        description: "La cotización se ha descargado como PDF.",
      });
    } catch (error) {
      toast({
        title: "Error al generar PDF",
        description: error instanceof Error ? error.message : "Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    const data: QuotationData = {
      client: clientName,
      projectType: projectType,
      modules: modules,
      selected: selectedModules.map(m => m.id),
      timestamp: new Date().toISOString(),
      version: '3.0',
      totalAmount: totalAmount
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizador-webnova-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Datos exportados",
      description: "Los datos se han exportado exitosamente.",
    });
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as QuotationData;
          if (data.modules && Array.isArray(data.modules)) {
            if (window.confirm('¿Deseas reemplazar los datos actuales con los importados?')) {
              onImportData(data);
              toast({
                title: "Datos importados",
                description: "Los datos se han importado exitosamente.",
              });
            }
          } else {
            throw new Error('Formato incorrecto');
          }
        } catch (error) {
          toast({
            title: "Error al importar",
            description: "El archivo no tiene el formato correcto.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearSelection = () => {
    if (window.confirm('¿Deseas limpiar toda la selección actual?')) {
      onClearSelection();
      toast({
        title: "Selección limpiada",
        description: "Se han removido todos los módulos seleccionados.",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-white/20">
      <Button
        onClick={handleGeneratePDF}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg transform hover:scale-105 transition-bounce flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        PDF Profesional
      </Button>
      
      <Button
        onClick={handleExportData}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg transform hover:scale-105 transition-bounce flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Exportar JSON
      </Button>
      
      <Button
        onClick={handleImportData}
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold shadow-lg transform hover:scale-105 transition-bounce flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Importar
      </Button>
      
      <Button
        onClick={handleClearSelection}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg transform hover:scale-105 transition-bounce flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Limpiar
      </Button>
    </div>
  );
};