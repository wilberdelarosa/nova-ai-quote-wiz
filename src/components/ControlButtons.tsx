import { useState, useRef } from "react";
import { Download, Upload, Trash2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFService } from "@/services/pdfService";
import { PDFPreview } from "@/components/PDFPreview";
import { Module, QuotationData } from "@/types/quotation";
import { useToast } from "@/hooks/use-toast";

interface ControlButtonsProps {
  clientName: string;
  projectType: string;
  modules: Module[];
  selectedModules: Module[];
  totalAmount: number;
  usdRate: number;
  onImportData: (data: QuotationData) => void;
  onClearSelection: () => void;
}

export const ControlButtons = ({ 
  clientName,
  projectType,
  modules,
  selectedModules,
  totalAmount,
  usdRate,
  onImportData,
  onClearSelection
}: ControlButtonsProps) => {
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfService = new PDFService();

  const handlePreviewPDF = () => {
    if (!clientName.trim()) {
      toast({
        title: "Cliente requerido",
        description: "Por favor, ingresa el nombre del cliente antes de generar el PDF.",
        variant: "destructive",
      });
      return;
    }

    if (selectedModules.length === 0) {
      toast({
        title: "Sin módulos seleccionados",
        description: "Por favor, selecciona al menos un módulo para generar la cotización.",
        variant: "destructive",
      });
      return;
    }

    setShowPDFPreview(true);
  };

  const handleDownloadPDF = async () => {
    if (!clientName.trim()) {
      toast({
        title: "Cliente requerido",
        description: "Por favor, ingresa el nombre del cliente antes de generar el PDF.",
        variant: "destructive",
      });
      return;
    }

    if (selectedModules.length === 0) {
      toast({
        title: "Sin módulos seleccionados",
        description: "Por favor, selecciona al menos un módulo para generar la cotización.",
        variant: "destructive",
      });
      return;
    }

    try {
      await pdfService.generateProfessionalPDF(
        clientName,
        projectType,
        selectedModules,
        totalAmount,
        usdRate
      );
      toast({
        title: "PDF generado",
        description: "La cotización se ha descargado correctamente.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo descargar el PDF.",
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
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
    <>
      <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-white/20">
        <Button
          onClick={handlePreviewPDF}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg transform hover:scale-105 transition-bounce flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Vista Previa PDF
        </Button>

        <Button
          onClick={handleDownloadPDF}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg transform hover:scale-105 transition-bounce flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Descargar PDF
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

        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileImport}
        />
      </div>

      <PDFPreview
        isVisible={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        clientName={clientName}
        projectType={projectType}
        selectedModules={selectedModules}
        totalAmount={totalAmount}
        usdRate={usdRate}
      />
    </>
  );
};