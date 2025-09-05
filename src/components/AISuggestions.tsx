import { useState } from "react";
import { Lightbulb, X, Edit, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface AISuggestionsProps {
  content: string;
  isVisible: boolean;
  onClose: () => void;
  onEdit?: (content: string) => void;
}

export const AISuggestions = ({ content, isVisible, onClose, onEdit }: AISuggestionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  if (!isVisible) return null;

  const handleStartEdit = () => {
    setEditedContent(content.replace(/<[^>]*>/g, ''));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      const html = DOMPurify.sanitize(marked.parse(editedContent) as string);
      onEdit(`<div class="text-gray-800 prose max-w-none">${html}</div>`);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  // Process content to remove markdown artifacts and improve formatting
  const processedContent = content.replace(/\*\*/g, '').replace(/#{1,6}\s/g, '').replace(/[-*]\s/g, '');

  return (
    <Card className="bg-white rounded-2xl border-gray-200 shadow-elegant backdrop-blur-sm animate-slide-in-up">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            <span className="text-blue-600">Sugerencias de IA</span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                onClick={handleStartEdit}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="bg-white text-gray-800 placeholder:text-gray-500 focus:bg-gray-50 transition-all duration-200 min-h-[200px]"
              placeholder="Edita el contenido generado por la IA..."
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="text-gray-800 prose max-w-none bg-gray-50 rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        )}
      </CardContent>
    </Card>
  );
};