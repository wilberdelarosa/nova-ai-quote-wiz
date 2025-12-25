import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createPortal } from "react-dom";
import { X, Download, Palette, FileText, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PDFService } from "@/services/pdfService";
import { Module } from "@/types/quotation";

interface PDFPreviewProps {
  isVisible: boolean;
  onClose: () => void;
  clientName: string;
  projectType: string;
  selectedModules: Module[];
  totalAmount: number;
  usdRate: number;
}

export const PDFPreview = ({
  isVisible,
  onClose,
  clientName,
  projectType,
  selectedModules,
  totalAmount,
  usdRate
}: PDFPreviewProps) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [editableContent, setEditableContent] = useState({
    clientName,
    projectType,
    companyEmail: "info.webnovalab@gmail.com",
    companyPhone: "+1 (809) 123-4567",
    notes: "Gracias por la oportunidad de cotizar para su proyecto. ¡Esperamos trabajar con ustedes!",
    terms: [
      "El proyecto incluye 2 rondas de revisiones sin costo adicional",
      "Cambios mayores fuera del alcance original se cotizarán por separado",
      "El cliente debe proporcionar contenido y materiales dentro de 5 días hábiles",
      "Garantía de 3 meses en funcionalidades desarrolladas",
      "Soporte técnico gratuito por 30 días post-entrega"
    ]
  });

  if (!isVisible) return null;

  const pdfService = new PDFService();

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await pdfService.generateProfessionalPDF(
        editableContent.clientName,
        editableContent.projectType,
        selectedModules,
        totalAmount,
        usdRate,
        isDarkTheme,
        {
          companyEmail: editableContent.companyEmail,
          companyPhone: editableContent.companyPhone,
          notes: editableContent.notes,
          terms: editableContent.terms
        }
      );
      toast({
        title: "PDF generado",
        description: "La cotización se ha descargado correctamente.",
      });
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo descargar el PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewContent = pdfService.createPDFContent(
    editableContent.clientName,
    editableContent.projectType,
    selectedModules,
    totalAmount,
    usdRate,
    isDarkTheme,
    {
      companyEmail: editableContent.companyEmail,
      companyPhone: editableContent.companyPhone,
      notes: editableContent.notes,
      terms: editableContent.terms
    }
  );

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Responsive */}
        <CardHeader className="flex-shrink-0 p-4 sm:p-6 border-b bg-gray-50">
          {/* Mobile: stacked layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Title row */}
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-webnova-600" />
                <span className="hidden sm:inline">Vista Previa del PDF</span>
                <span className="sm:hidden">Vista Previa</span>
              </CardTitle>

              {/* Close button - always visible */}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="sm:hidden text-gray-500 hover:text-gray-700 -mr-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 sm:ml-auto">
              {/* Edit toggle */}
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                size="sm"
                className="text-gray-700 hover:text-gray-900 flex-1 sm:flex-none"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                <span className="sm:hidden">{isEditing ? 'Ver' : 'Editar'}</span>
                <span className="hidden sm:inline">{isEditing ? 'Ver Vista Previa' : 'Editar Plantilla'}</span>
              </Button>

              {/* Theme toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Palette className="w-4 h-4 text-gray-600" />
                <Label htmlFor="theme-switch" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                  <span className="hidden sm:inline">Tema Oscuro</span>
                  <span className="sm:hidden">Dark</span>
                </Label>
                <Switch
                  id="theme-switch"
                  checked={isDarkTheme}
                  onCheckedChange={setIsDarkTheme}
                />
              </div>

              {/* Desktop close button */}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          {/* Edit/Preview Area */}
          <div className="flex-1 overflow-auto bg-gray-100">
            {isEditing ? (
              <div className="p-4 sm:p-6 space-y-4 bg-white">
                {/* Form fields - responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cliente</Label>
                    <Input
                      value={editableContent.clientName}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, clientName: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tipo de Proyecto</Label>
                    <Input
                      value={editableContent.projectType}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, projectType: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email de la Empresa</Label>
                    <Input
                      value={editableContent.companyEmail}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, companyEmail: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Teléfono de la Empresa</Label>
                    <Input
                      value={editableContent.companyPhone}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, companyPhone: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Notas Finales</Label>
                  <Textarea
                    value={editableContent.notes}
                    onChange={(e) => setEditableContent(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Términos y Condiciones</Label>
                  <div className="space-y-2 mt-2">
                    {editableContent.terms.map((term, index) => (
                      <Textarea
                        key={index}
                        value={term}
                        onChange={(e) => {
                          const newTerms = [...editableContent.terms];
                          newTerms[index] = e.target.value;
                          setEditableContent(prev => ({ ...prev, terms: newTerms }));
                        }}
                        className="text-sm"
                        rows={2}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 flex justify-center">
                <div
                  className="bg-white shadow-lg transform scale-50 sm:scale-75 origin-top"
                  style={{ width: '800px', minHeight: '1000px' }}
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </div>
            )}
          </div>

          {/* Actions - Responsive */}
          <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto font-semibold order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="w-full sm:w-auto btn-success font-bold order-1 sm:order-2"
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