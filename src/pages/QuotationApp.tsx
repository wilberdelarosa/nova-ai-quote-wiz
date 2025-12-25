import { useState, useEffect, useMemo } from "react";
import { QuotationHero } from "@/components/QuotationHero";
import { ClientForm } from "@/components/ClientForm";
import { AIAssistant } from "@/components/AIAssistant";
import { ModuleManager } from "@/components/ModuleManager";
import { ModuleCard } from "@/components/ModuleCard";
import { ProjectSummary } from "@/components/ProjectSummary";
import { ControlButtons } from "@/components/ControlButtons";
import { AISuggestions } from "@/components/AISuggestions";
import { ModuleCreator } from "@/components/ModuleCreator";
import { FloatingAIAssistant } from "@/components/FloatingAIAssistant";
import { QuotationsVault } from "@/components/QuotationsVault";
import { Card, CardContent } from "@/components/ui/card";
import { Module, DEFAULT_MODULES, QuotationData } from "@/types/quotation";
import { useUsdRate } from "@/hooks/useUsdRate";
import { Code2 } from "lucide-react";
import type { Quotation } from "@/services/databaseService";

export default function QuotationApp() {
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [aiSuggestions, setAISuggestions] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [nextId, setNextId] = useState(15);
  const { usdRate, isLoading: isLoadingRate, lastUpdated, updateRate } = useUsdRate();
  const [showModuleCreator, setShowModuleCreator] = useState(false);
  const [suggestedModule, setSuggestedModule] = useState<{ name: string; price: number; description: string } | null>(null);

  // Computed values
  const selectedModules = useMemo(() =>
    modules.filter(m => selectedModuleIds.includes(m.id)),
    [modules, selectedModuleIds]
  );

  const totalAmount = useMemo(() =>
    selectedModules.reduce((sum, m) => sum + m.price, 0),
    [selectedModules]
  );

  // Local storage persistence
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined'
        ? localStorage.getItem('webnova-quotation')
        : null;
      if (saved) {
        const data = JSON.parse(saved);
        setClientName(data.clientName || "");
        setProjectType(data.projectType || "");
        setModules(data.modules || DEFAULT_MODULES);
        setSelectedModuleIds(data.selectedModuleIds || []);
        setNextId(data.nextId || 15);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          clientName,
          projectType,
          modules,
          selectedModuleIds,
          nextId
        };
        localStorage.setItem('webnova-quotation', JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }
  }, [clientName, projectType, modules, selectedModuleIds, nextId]);

  // Event handlers
  const handleToggleModule = (moduleId: number) => {
    setSelectedModuleIds(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleAddModule = (moduleData: Omit<Module, 'id'>) => {
    const newModule: Module = {
      ...moduleData,
      id: nextId
    };
    setModules(prev => [...prev, newModule]);
    setNextId(prev => prev + 1);
  };

  const handleEditModule = (moduleId: number, moduleData: Omit<Module, 'id'>) => {
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...moduleData, id: moduleId } : m
    ));
    setEditingModule(null);
  };

  const handleDeleteModule = (moduleId: number) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    setSelectedModuleIds(prev => prev.filter(id => id !== moduleId));
  };

  const handleStartEdit = (module: Module) => {
    setEditingModule(module);
  };

  const handleCancelEdit = () => {
    setEditingModule(null);
  };

  const handleShowAISuggestions = (content: string) => {
    // Extract suggested modules from AI content
    const moduleRegex = /<div class="bg-green-50[^>]*>[\s\S]*?<strong>Nombre:<\/strong>\s*([^<]+)[\s\S]*?<strong>Precio:<\/strong>\s*RD\$(\d+)[\s\S]*?<strong>Descripción:<\/strong>\s*([^<]+)[\s\S]*?<\/div>/g;
    const structuredRegex = /data-name="([^"]+)"[^>]*data-price="([^"]+)"[^>]*data-category="([^"]+)"/g;
    let match;

    // Prefer structured suggestions (from expert system)
    if (!suggestedModule) {
      while ((match = structuredRegex.exec(content)) !== null) {
        const [, name, price] = match;
        const parsedPrice = Number(price);
        if (!Number.isNaN(parsedPrice)) {
          setSuggestedModule({
            name: name.trim(),
            price: parsedPrice,
            description: "Módulo sugerido por IA",
          });
          setShowModuleCreator(true);
          break;
        }
      }
    }

    // Legacy pattern (HTML panel)
    if (!suggestedModule) {
      while ((match = moduleRegex.exec(content)) !== null) {
        const [, name, price, description] = match;
        setSuggestedModule({
          name: name.trim(),
          price: parseInt(price),
          description: description.trim()
        });
        setShowModuleCreator(true);
        break; // Only handle the first suggested module
      }
    }

    setAISuggestions(content);
    setShowAISuggestions(true);
    // Scroll to suggestions
    setTimeout(() => {
      const element = document.getElementById('ai-suggestions');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCreateModule = (moduleData: Omit<Module, 'id'>) => {
    const newModule: Module = {
      ...moduleData,
      id: nextId
    };
    setModules(prev => [...prev, newModule]);
    setNextId(prev => prev + 1);
  };

  const handleImportData = (data: QuotationData) => {
    setClientName(data.client || "");
    setProjectType(data.projectType || "");
    setModules(data.modules || DEFAULT_MODULES);
    setSelectedModuleIds(data.selected || []);
    setNextId(Math.max(...data.modules.map(m => m.id)) + 1);
  };

  const handleLoadQuotation = (q: Quotation) => {
    setClientName(q.client_name || "");
    setProjectType(q.project_type || "");

    const incoming = (q.selected_modules || []) as Module[];
    if (incoming.length === 0) {
      setSelectedModuleIds([]);
      return;
    }

    setModules((prev) => {
      const updated = [...prev];
      const selectedIds: number[] = [];
      let idCounter = nextId;

      for (const inc of incoming) {
        const existing = prev.find((m) => m.id === inc.id) || prev.find((m) => m.name === inc.name && m.price === inc.price);
        if (existing) {
          selectedIds.push(existing.id);
          continue;
        }

        const newModule: Module = {
          id: idCounter,
          name: inc.name,
          price: inc.price,
          description: inc.description,
          category: inc.category,
          estimatedHours: inc.estimatedHours,
        };
        updated.push(newModule);
        selectedIds.push(newModule.id);
        idCounter += 1;
      }

      setSelectedModuleIds(selectedIds);
      setNextId(idCounter);
      return updated;
    });
  };

  const handleClearSelection = () => {
    setSelectedModuleIds([]);
  };

  return (
    <div className="min-h-screen bg-gradient-hero font-inter">
      {/* Header - Responsive */}
      <header className="relative overflow-hidden bg-gradient-to-r from-webnova-800 via-webnova-700 to-webnova-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container-app py-8 sm:py-12 lg:py-16 text-center">
          {/* Logo */}
          <div className="animate-float mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Code2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 sm:mb-3 tracking-tight">
            WebNova<span className="text-webnova-200">Lab</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-webnova-100/90 max-w-xl mx-auto leading-relaxed px-4">
            Cotizador Profesional de Proyectos Web
          </p>

          {/* Decorative dots */}
          <div className="mt-6 flex justify-center space-x-2">
            <div className="h-1.5 w-1.5 bg-webnova-200 rounded-full animate-pulse"></div>
            <div className="h-1.5 w-1.5 bg-webnova-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="h-1.5 w-1.5 bg-webnova-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* Client Info and AI Panel */}
        <section className="animate-slide-in-up">
          <Card className="glass rounded-2xl sm:rounded-3xl border-white/10 shadow-card">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Info */}
                <div>
                  <ClientForm
                    clientName={clientName}
                    projectType={projectType}
                    onClientNameChange={setClientName}
                    onProjectTypeChange={setProjectType}
                  />
                </div>

                {/* Enhanced AI Assistant */}
                <AIAssistant
                  clientName={clientName}
                  projectType={projectType}
                  selectedModules={selectedModules}
                  totalAmount={totalAmount}
                  onShowSuggestions={handleShowAISuggestions}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Control Buttons */}
        <section className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <Card className="glass rounded-2xl sm:rounded-3xl border-white/10 shadow-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <ModuleManager
                  onAddModule={handleAddModule}
                  onEditModule={handleEditModule}
                  editingModule={editingModule}
                  onCancelEdit={handleCancelEdit}
                />
                <ControlButtons
                  clientName={clientName}
                  projectType={projectType}
                  modules={modules}
                  selectedModules={selectedModules}
                  totalAmount={totalAmount}
                  usdRate={usdRate}
                  onImportData={handleImportData}
                  onClearSelection={handleClearSelection}
                />

                <div className="pt-4 sm:pt-6 border-t border-white/10">
                  <QuotationsVault
                    clientName={clientName}
                    projectType={projectType}
                    selectedModules={selectedModules}
                    totalAmountDop={totalAmount}
                    usdRate={usdRate}
                    onLoadQuotation={handleLoadQuotation}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* AI Suggestions Panel */}
        <section id="ai-suggestions">
          <AISuggestions
            content={aiSuggestions}
            isVisible={showAISuggestions}
            onClose={() => setShowAISuggestions(false)}
            onEdit={setAISuggestions}
            onAddModule={handleCreateModule}
          />
        </section>

        {/* Modules Grid - Responsive */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="animate-slide-in-up"
              style={{ animationDelay: `${0.05 * (index % 8)}s` }}
            >
              <ModuleCard
                module={module}
                isSelected={selectedModuleIds.includes(module.id)}
                onToggleSelect={handleToggleModule}
                onEdit={handleStartEdit}
                onDelete={handleDeleteModule}
              />
            </div>
          ))}
        </section>

        {/* Summary Section */}
        <section className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <ProjectSummary
            selectedModules={selectedModules}
            totalAmount={totalAmount}
            usdRate={usdRate}
            isLoadingRate={isLoadingRate}
            lastUpdated={lastUpdated}
            onUpdateRate={updateRate}
            onRemoveModule={handleToggleModule}
          />
        </section>
      </main>

      {/* Module Creator Modal */}
      <ModuleCreator
        isOpen={showModuleCreator}
        onClose={() => {
          setShowModuleCreator(false);
          setSuggestedModule(null);
        }}
        onCreateModule={handleCreateModule}
        suggestedModule={suggestedModule}
      />

      {/* Floating AI Assistant */}
      <FloatingAIAssistant
        modules={modules}
        selectedModules={selectedModules}
        onAddModule={handleAddModule}
        clientName={clientName}
        projectType={projectType}
      />
    </div>
  );
}