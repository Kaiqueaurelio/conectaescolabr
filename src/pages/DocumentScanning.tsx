import { useState, useRef } from "react";
import { ModernLayout, ModernCard, ModernSection, ModernEmptyState } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader, ModernTabs } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { FileText, Upload, Camera, Download, Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface ScannedDocument {
  id: string;
  filename: string;
  type: string;
  uploaded_at: string;
  status: "selected" | "error";
  file: File;
  extracted_text?: string;
  user_id?: string;
}

export function DocumentScanningPage() {
  const { user: currentUser } = useSupabaseAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("upload");
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const supported = file.type.startsWith("image/") || file.type === "application/pdf";
      if (!supported) toast.error(`${file.name}: formato não suportado.`);
      else if (file.size > 10 * 1024 * 1024) toast.error(`${file.name}: o limite é 10 MB.`);
      return supported && file.size <= 10 * 1024 * 1024;
    });

    setDocuments((prev) => [
      ...prev,
      ...validFiles.map((file, index): ScannedDocument => ({
        id: `doc-${Date.now()}-${index}`,
        filename: file.name,
        type: file.type === "application/pdf" ? "PDF" : "Imagem",
        uploaded_at: new Date().toISOString(),
        status: "selected",
        file,
      })),
    ]);

    if (validFiles.length > 0) {
      toast.info("Arquivo selecionado nesta sessão. O OCR e o armazenamento permanente ainda não estão conectados.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem excede o limite de 10 MB.");
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      return;
    }

    setDocuments((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}`,
        filename: file.name || `Captura_${new Date().toISOString().split("T")[0]}.jpg`,
        type: "Captura de Câmera",
        uploaded_at: new Date().toISOString(),
        status: "selected",
        file,
      },
    ]);
    toast.info("Captura selecionada nesta sessão. O OCR e o armazenamento permanente ainda não estão conectados.");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleDeleteDocument = (id: string) => {
    if (!window.confirm("Remover este documento?")) return;
    setDocuments(documents.filter((d) => d.id !== id));
    toast.success("Documento removido");
  };

  const handleClearDocuments = () => {
    if (!window.confirm("Remover todos os documentos digitalizados?")) return;
    setDocuments([]);
    toast.success("Documentos removidos");
  };

  const handleDownloadDocument = (doc: ScannedDocument) => {
    const url = URL.createObjectURL(doc.file);
    const element = document.createElement("a");
    element.href = url;
    element.download = doc.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  const tabs = [
    { label: "Upload de Arquivos", value: "upload", icon: <Upload className="w-4 h-4" /> },
    { label: "Captura de Câmera", value: "camera", icon: <Camera className="w-4 h-4" /> },
    { label: "Documentos Processados", value: "processed", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Digitalização de Documentos"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="OCR e Digitalização"
            description="Selecione e baixe arquivos. A extração OCR e o armazenamento permanente ainda não estão configurados."
            icon={<FileText />}
          />

          <ModernTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Aba: Upload de Arquivos */}
          {activeTab === "upload" && (
            <div className="space-y-6 mt-6">
              <ModernCard className="p-12 border-2 border-dashed border-border hover:border-primary transition-colors">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Enviar Documentos</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Formatos aceitos: PNG, JPG, PDF (máx. 10 MB)
                  </p>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Aba: Captura de Câmera */}
          {activeTab === "camera" && (
            <div className="space-y-6 mt-6">
              <ModernCard className="p-12 text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Capturar com Câmera</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Use a câmera do seu dispositivo para capturar documentos
                </p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
                <Button onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" />
                  Abrir Câmera
                </Button>
              </ModernCard>
            </div>
          )}

          {/* Aba: Documentos Processados */}
          {activeTab === "processed" && (
            <div className="space-y-6 mt-6">
              <ModernSection title="Documentos Digitalizados">
                {documents.length === 0 ? (
                  <ModernEmptyState
                    icon={<FileText />}
                    title="Nenhum documento"
                    description="Comece enviando ou capturando documentos"
                  />
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <ModernCard key={doc.id} className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {doc.filename}
                              </h3>
                              <p className="text-sm text-muted-foreground">{doc.type}</p>

                              {doc.status === "error" && doc.extracted_text && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-xs font-medium text-foreground mb-2">
                                    Texto Extraído:
                                  </p>
                                  <p className="text-xs text-foreground/80 line-clamp-3">
                                    {doc.extracted_text}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {false && doc.status === "selected" && (
                              <div className="flex items-center gap-2 text-warning">
                                <Clock className="w-4 h-4 animate-spin" />
                                <span className="text-xs">Processando...</span>
                              </div>
                            )}
                            {false && doc.status === "selected" && (
                              <CheckCircle className="w-5 h-5 text-success" />
                            )}

                            <div className="flex gap-2">
                              {doc.status === "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadDocument(doc)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </ModernCard>
                    ))}
                  </div>
                )}
              </ModernSection>
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
