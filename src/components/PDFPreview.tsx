import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, Palette, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PDFService } from "@/services/pdfService";
import { Module } from "@/types/quotation";

interface PDFPreviewProps {
  isVisible: boolean;
  onClose: () => void;
  clientName: string;
  projectType: string;
  selectedModules: Module[];
  totalAmount: number;
}

export const PDFPreview = ({ 
  isVisible, 
  onClose, 
  clientName, 
  projectType, 
  selectedModules, 
  totalAmount 
}: PDFPreviewProps) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isVisible) return null;

  const pdfService = new PDFService();

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await pdfService.generateProfessionalPDF(
        clientName,
        projectType,
        selectedModules,
        totalAmount,
        isDarkTheme
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const previewContent = pdfService.createPDFContent(
    clientName,
    projectType,
    selectedModules,
    totalAmount,
    isDarkTheme
  );

  return createPortal(
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <Card className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Vista Previa del PDF
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-800" />
              <Label htmlFor="theme-switch" className="text-sm font-medium">
                Tema Oscuro
              </Label>
              <Switch
                id="theme-switch"
                checked={isDarkTheme}
                onCheckedChange={setIsDarkTheme}
              />
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Preview Area */}
          <div className="h-[60vh] overflow-auto bg-gray-100">
            <div 
              className="mx-auto bg-white shadow-lg transform scale-75 origin-top"
              style={{ width: '800px', minHeight: '1000px' }}
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
          
          {/* Actions */}
          <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="font-bold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="bg-gradient-to-r from-webnova-500 to-webnova-600 hover:from-webnova-600 hover:to-webnova-700 text-white font-bold"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full w-4 h-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
};