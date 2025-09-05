import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, Palette, FileText, Edit3, Save } from "lucide-react";
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
    } catch (error) {
      console.error('Error generating PDF:', error);
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <Card className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Vista Previa del PDF
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Ver Vista Previa' : 'Editar Plantilla'}
            </Button>
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
          {/* Edit/Preview Area */}
          <div className="h-[60vh] overflow-auto bg-gray-100">
            {isEditing ? (
              <div className="p-6 space-y-4 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cliente</Label>
                    <Input
                      value={editableContent.clientName}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, clientName: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo de Proyecto</Label>
                    <Input
                      value={editableContent.projectType}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, projectType: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email de la Empresa</Label>
                    <Input
                      value={editableContent.companyEmail}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, companyEmail: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Teléfono de la Empresa</Label>
                    <Input
                      value={editableContent.companyPhone}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, companyPhone: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Notas Finales</Label>
                  <Textarea
                    value={editableContent.notes}
                    onChange={(e) => setEditableContent(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Términos y Condiciones</Label>
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
              <div 
                className="mx-auto bg-white shadow-lg transform scale-75 origin-top"
                style={{ width: '800px', minHeight: '1000px' }}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            )}
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