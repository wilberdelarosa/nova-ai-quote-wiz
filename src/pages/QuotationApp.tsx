import { useState, useEffect, useMemo } from "react";
import { QuotationHero } from "@/components/QuotationHero";
import { ClientForm } from "@/components/ClientForm";
import { AIAssistant } from "@/components/AIAssistant";
import { ModuleManager } from "@/components/ModuleManager";
import { ModuleCard } from "@/components/ModuleCard";
import { ProjectSummary } from "@/components/ProjectSummary";
import { ControlButtons } from "@/components/ControlButtons";
import { AISuggestions } from "@/components/AISuggestions";
import { Card, CardContent } from "@/components/ui/card";
import { Module, DEFAULT_MODULES, QuotationData } from "@/types/quotation";

export default function QuotationApp() {
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [aiSuggestions, setAISuggestions] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [nextId, setNextId] = useState(15);

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
    const saved = localStorage.getItem('webnova-quotation');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setClientName(data.clientName || "");
        setProjectType(data.projectType || "");
        setModules(data.modules || DEFAULT_MODULES);
        setSelectedModuleIds(data.selectedModuleIds || []);
        setNextId(data.nextId || 15);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const data = {
      clientName,
      projectType,
      modules,
      selectedModuleIds,
      nextId
    };
    localStorage.setItem('webnova-quotation', JSON.stringify(data));
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

  const handleImportData = (data: QuotationData) => {
    setClientName(data.client || "");
    setProjectType(data.projectType || "");
    setModules(data.modules || DEFAULT_MODULES);
    setSelectedModuleIds(data.selected || []);
    setNextId(Math.max(...data.modules.map(m => m.id)) + 1);
  };

  const handleClearSelection = () => {
    setSelectedModuleIds([]);
  };

  return (
    <div className="min-h-screen bg-gradient-hero font-inter">
      {/* Hero Section */}
      <QuotationHero />

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Client Info and AI Panel */}
        <div className="mb-8 animate-slide-in-up">
          <Card className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Info */}
                <div className="lg:col-span-2">
                  <ClientForm
                    clientName={clientName}
                    projectType={projectType}
                    onClientNameChange={setClientName}
                    onProjectTypeChange={setProjectType}
                  />
                </div>
                
                {/* AI Assistant */}
                <AIAssistant
                  clientName={clientName}
                  projectType={projectType}
                  selectedModules={selectedModules}
                  totalAmount={totalAmount}
                  onShowSuggestions={handleShowAISuggestions}
                />
              </div>
              
              {/* Control Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
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
                  onImportData={handleImportData}
                  onClearSelection={handleClearSelection}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions Panel */}
        <div id="ai-suggestions" className="mb-8">
          <AISuggestions
            content={aiSuggestions}
            isVisible={showAISuggestions}
            onClose={() => setShowAISuggestions(false)}
          />
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              isSelected={selectedModuleIds.includes(module.id)}
              onToggleSelect={handleToggleModule}
              onEdit={handleStartEdit}
              onDelete={handleDeleteModule}
            />
          ))}
        </div>

        {/* Summary Section */}
        <ProjectSummary
          selectedModules={selectedModules}
          totalAmount={totalAmount}
          onRemoveModule={handleToggleModule}
        />
      </div>
    </div>
  );
}