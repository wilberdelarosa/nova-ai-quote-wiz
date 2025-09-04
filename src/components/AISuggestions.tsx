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
      const html = DOMPurify.sanitize(marked.parse(editedContent));
      onEdit(`<div class="text-white prose prose-invert max-w-none">${html}</div>`);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  return (
    <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl border-white/20 shadow-elegant backdrop-blur-sm animate-slide-in-up">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            Sugerencias de IA
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                onClick={handleStartEdit}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
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
                className="text-white/70 hover:text-white hover:bg-white/10"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="text-white prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </CardContent>
    </Card>
  );
};