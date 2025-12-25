import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { db, type Quotation } from "@/services/databaseService";
import type { Module } from "@/types/quotation";
import { useToast } from "@/hooks/use-toast";
import { Archive, RefreshCw, Save, CheckCircle2, Clock, Trash2, Upload } from "lucide-react";

export type QuotationStatus = "draft" | "finalized";

interface QuotationsVaultProps {
  clientName: string;
  projectType: string;
  selectedModules: Module[];
  totalAmountDop: number;
  usdRate: number;
  onLoadQuotation: (q: Quotation) => void;
}

function normalizeStatus(status: string | null | undefined): QuotationStatus {
  if (status === "finalized") return "finalized";
  return "draft";
}

export const QuotationsVault = ({
  clientName,
  projectType,
  selectedModules,
  totalAmountDop,
  usdRate,
  onLoadQuotation,
}: QuotationsVaultProps) => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [activeTab, setActiveTab] = useState<"draft" | "finalized" | "all">("draft");
  const [query, setQuery] = useState("");

  const refresh = async () => {
    setIsLoading(true);
    try {
      const list = await db.getQuotations();
      setQuotations(list);
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudieron cargar las cotizaciones";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byTab = quotations.filter((item) => {
      const st = normalizeStatus(item.status);
      if (activeTab === "all") return true;
      return st === activeTab;
    });

    if (!q) return byTab;
    return byTab.filter((item) => {
      const haystack = `${item.client_name} ${item.project_type} ${item.status ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [quotations, activeTab, query]);

  const canSave = clientName.trim().length > 0 && projectType.trim().length > 0 && selectedModules.length > 0;

  const handleSaveCurrent = async () => {
    if (!canSave) {
      toast({
        title: "Cotización incompleta",
        description: "Completa cliente, tipo de proyecto y selecciona módulos antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const totalUsd = usdRate ? Number((totalAmountDop / usdRate).toFixed(2)) : null;
      await db.saveQuotation({
        client_name: clientName.trim(),
        client_email: null,
        client_phone: null,
        project_type: projectType.trim(),
        project_description: null,
        selected_modules: selectedModules,
        total_usd: totalUsd,
        total_dop: totalAmountDop,
        exchange_rate: usdRate || null,
        discount_percent: 0,
        status: "draft",
        notes: null,
        ai_suggestions: null,
      });

      toast({ title: "Guardada", description: "La cotización se guardó como pendiente (draft)." });
      await refresh();
      setActiveTab("draft");
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo guardar la cotización";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: QuotationStatus) => {
    const next: QuotationStatus = currentStatus === "draft" ? "finalized" : "draft";
    try {
      await db.updateQuotationStatus(id, next);
      await refresh();
      toast({
        title: "Actualizada",
        description: next === "finalized" ? "Marcada como finalizada." : "Marcada como pendiente (draft).",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo actualizar el estado";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("¿Eliminar esta cotización? Esta acción no se puede deshacer.");
      if (!ok) return;
    }

    try {
      await db.deleteQuotation(id);
      await refresh();
      toast({ title: "Eliminada", description: "La cotización fue eliminada." });
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo eliminar";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const formatMoney = (value: number | null) => {
    if (value == null) return "-";
    return `RD$ ${Math.round(value).toLocaleString()}`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("es-DO");
    } catch {
      return iso;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="btn-mobile bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-md flex items-center justify-center gap-2 hover-lift"
        >
          <Archive className="w-4 h-4" />
          <span>Cotizaciones</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white rounded-2xl sm:rounded-3xl shadow-elegant max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Archive className="w-5 h-5 text-slate-700" />
            Cotizaciones guardadas
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button onClick={refresh} variant="outline" size="sm" disabled={isLoading} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button onClick={handleSaveCurrent} size="sm" disabled={isSaving || !canSave} className="gap-2">
              <Save className={`w-4 h-4 ${isSaving ? "animate-pulse" : ""}`} />
              Guardar actual
            </Button>
          </div>

          <div className="flex-1 sm:flex-none sm:w-80">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por cliente o tipo…"
              className="bg-white"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="draft" className="gap-2">
              <Clock className="w-4 h-4" />
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="finalized" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Finalizadas
            </TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[55vh] pr-2">
              {filtered.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p className="font-medium">No hay cotizaciones en esta vista</p>
                  <p className="text-sm mt-1">Guarda una cotización o cambia el filtro.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((item) => {
                    const st = normalizeStatus(item.status);
                    return (
                      <div key={item.id} className="border rounded-xl p-4 bg-white flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 break-words">{item.client_name}</p>
                              <Badge variant={st === "finalized" ? "default" : "secondary"}>
                                {st === "finalized" ? "Finalizada" : "Pendiente"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 break-words">{item.project_type}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(item.created_at)}</p>
                          </div>

                          <div className="sm:text-right">
                            <p className="font-black text-gray-900">{formatMoney(item.total_dop)}</p>
                            <p className="text-xs text-gray-500">
                              {item.total_usd != null ? `$${Number(item.total_usd).toLocaleString()} USD` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              onLoadQuotation(item);
                              setOpen(false);
                              toast({ title: "Cargada", description: "Se cargó la cotización en el cotizador." });
                            }}
                          >
                            <Upload className="w-4 h-4" />
                            Cargar
                          </Button>

                          <Button
                            variant={st === "finalized" ? "secondary" : "default"}
                            size="sm"
                            className="gap-2"
                            onClick={() => handleToggleStatus(item.id, st)}
                          >
                            {st === "finalized" ? (
                              <>
                                <Clock className="w-4 h-4" />
                                Marcar pendiente
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Marcar finalizada
                              </>
                            )}
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </Button>
                        </div>

                        <div className="text-xs text-gray-500">
                          Módulos: {item.selected_modules?.length ?? 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
