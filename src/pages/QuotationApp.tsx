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
    <div className="bg-gradient-to-br from-gray-950 via-webnova-900 to-black min-h-screen font-inter">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-webnova-700 via-webnova-600 to-webnova-500">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-6 py-16 text-center">
          <div className="animate-float mb-8">
            <div className="inline-block p-4 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
              <i className="fas fa-code text-4xl text-white"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            WebNova<span className="text-webnova-200">Lab</span>
          </h1>
          <p className="text-xl text-webnova-100 max-w-2xl mx-auto leading-relaxed">
            Cotizador Profesional de Proyectos Web
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="h-2 w-2 bg-webnova-200 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-webnova-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="h-2 w-2 bg-webnova-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Client Info and Enhanced AI Panel */}
        <div className="mb-8 animate-slide-in-up">
          <Card className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-elegant">
            <CardContent className="p-6">
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
        </div>

        {/* Control Buttons */}
        <div className="mb-8 animate-slide-in-up">
          <Card className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 justify-center">
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
            onEdit={setAISuggestions}
          />
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
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