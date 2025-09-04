import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AISuggestionsProps {
  content: string;
  isVisible: boolean;
  onClose: () => void;
}

export const AISuggestions = ({ content, isVisible, onClose }: AISuggestionsProps) => {
  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-ai rounded-2xl border-white/20 shadow-elegant backdrop-blur-sm animate-slide-in-up">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            Sugerencias de IA
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="text-white prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </CardContent>
    </Card>
  );
};