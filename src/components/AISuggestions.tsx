import { useState } from "react";
import { Lightbulb, X, Edit, Save, RotateCcw, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface ModuleSuggestion {
  name: string;
  price: number;
  description: string;
  category?: string;
  estimatedHours?: number;
}

interface AISuggestionsProps {
  content: string;
  isVisible: boolean;
  onClose: () => void;
  onEdit?: (content: string) => void;
  onAddModule?: (module: { name: string; price: number; description: string; category?: string }) => void;
}

const parseModuleSuggestions = (content: string): ModuleSuggestion[] => {
  const modules: ModuleSuggestion[] = [];

  // Pattern 1: New format [MODULO_SUGERIDO]
  const newFormatRegex = /\[MODULO_SUGERIDO\]([\s\S]*?)\[\/MODULO_SUGERIDO\]/g;
  let match;

  while ((match = newFormatRegex.exec(content)) !== null) {
    const block = match[1];
    const nameMatch = block.match(/nombre:\s*"([^"]+)"/);
    const priceMatch = block.match(/precio:\s*(\d+)/);
    const descMatch = block.match(/descripcion:\s*"([^"]+)"/);
    const catMatch = block.match(/categoria:\s*"([^"]+)"/);
    const hoursMatch = block.match(/horasEstimadas:\s*(\d+)/);

    if (nameMatch && priceMatch) {
      modules.push({
        name: nameMatch[1],
        price: parseInt(priceMatch[1], 10),
        description: descMatch ? descMatch[1] : "Módulo sugerido por IA",
        category: catMatch ? catMatch[1] : "General",
        estimatedHours: hoursMatch ? parseInt(hoursMatch[1], 10) : undefined,
      });
    }
  }

  // Pattern 2: Old HTML format (green boxes)
  const oldFormatRegex = /<div class="bg-green-50[^>]*>[\s\S]*?<strong>Nombre:<\/strong>\s*([^<]+)[\s\S]*?<strong>Precio:<\/strong>\s*RD\$(\d+(?:,\d{3})*)[\s\S]*?<strong>Descripci[oó]n:<\/strong>\s*([^<]+)/g;

  while ((match = oldFormatRegex.exec(content)) !== null) {
    const name = match[1].trim();
    const price = parseInt(match[2].replace(/,/g, ""));
    const description = match[3].trim();
    modules.push({ name, price, description, category: "General" });
  }

  return modules;
};

const cleanContentToHtml = (content: string) => {
  const cleanedMarkdown = content
    .replace(/\[MODULO_SUGERIDO\][\s\S]*?\[\/MODULO_SUGERIDO\]/g, "")
    .replace(/\*\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/[-*]\s/g, "");

  const html = marked.parse(cleanedMarkdown) as string;
  return DOMPurify.sanitize(html);
};

export const AISuggestions = ({ content, isVisible, onClose, onEdit, onAddModule }: AISuggestionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const parsedModules = parseModuleSuggestions(content);
  const cleanedContent = cleanContentToHtml(content);

  if (!isVisible) return null;

  const handleStartEdit = () => {
    setEditedContent(content.replace(/<[^>]*>/g, ''));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      const html = DOMPurify.sanitize(marked.parse(editedContent) as string);
      onEdit(`<div class="text-gray-200 prose prose-invert max-w-none">${html}</div>`);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  const handleAddModule = (module: ModuleSuggestion) => {
    if (onAddModule) {
      onAddModule({
        name: module.name,
        price: module.price,
        description: module.description,
        category: module.category
      });
    }
  };

  return (
    <Card className="glass border-webnova-500/30 rounded-2xl sm:rounded-3xl shadow-card animate-slide-in-up overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span>Sugerencias de IA</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            {!isEditing && (
              <Button
                onClick={handleStartEdit}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2">
          {/* Module Suggestions Cards */}
          {parsedModules.length > 0 && onAddModule && (
            <div className="mb-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Módulos Sugeridos ({parsedModules.length})
              </h4>
              <div className="space-y-2">
                {parsedModules.map((module, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-white/10 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{module.name}</p>
                      <p className="text-sm text-gray-400 line-clamp-1">{module.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-emerald-400 font-bold">RD${module.price.toLocaleString()}</span>
                        {module.category && (
                          <span className="text-xs bg-webnova-500/20 text-webnova-200 px-2 py-0.5 rounded-full">
                            {module.category}
                          </span>
                        )}
                        {module.estimatedHours && (
                          <span className="text-xs text-gray-500">~{module.estimatedHours}h</span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddModule(module)}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Area with Scroll */}
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-gray-800 text-white placeholder:text-gray-500 focus:bg-gray-700 transition-all duration-200 min-h-[200px] border-white/10"
                placeholder="Edita el contenido generado por la IA..."
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-[55vh] sm:max-h-[60vh] pr-2">
              <div
                className="prose prose-sm prose-invert max-w-none bg-gray-900/70 rounded-xl p-4 border border-white/10 leading-relaxed space-y-3 shadow-lg shadow-black/30 [&_p]:text-gray-200 [&_li]:text-gray-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-webnova-300 [&_strong]:text-white [&_a]:text-webnova-300 [&_blockquote]:border-l-4 [&_blockquote]:border-webnova-500 [&_blockquote]:pl-4 [&_code]:text-amber-300 [&_table]:text-gray-200 [&_th]:text-white [&_th]:bg-gray-800 [&_td]:border-gray-700"
                dangerouslySetInnerHTML={{ __html: cleanedContent }}
              />
            </ScrollArea>
          )}
        </CardContent>
      )}
    </Card>
  );
};