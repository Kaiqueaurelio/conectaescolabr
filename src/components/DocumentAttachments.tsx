import { useState } from "react";
import { Upload, File, Trash2, Download, Eye, FileText, Image as ImageIcon, Music, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  url?: string;
  category: "medical" | "financial" | "legal" | "educational" | "other";
}

interface DocumentAttachmentsProps {
  attachments: Attachment[];
  onUpload: (file: File, category: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  readOnly?: boolean;
}

export function DocumentAttachments({
  attachments,
  onUpload,
  onDelete,
  readOnly = false,
}: DocumentAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("other");

  const categories = [
    { value: "medical", label: "Médico", color: "bg-red-100 text-red-700" },
    { value: "financial", label: "Financeiro", color: "bg-green-100 text-green-700" },
    { value: "legal", label: "Legal", color: "bg-blue-100 text-blue-700" },
    { value: "educational", label: "Educacional", color: "bg-purple-100 text-purple-700" },
    { value: "other", label: "Outro", color: "bg-gray-100 text-gray-700" },
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith("audio/")) return <Music className="w-4 h-4" />;
    if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
    if (type === "application/pdf") return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await onUpload(files[i], selectedCategory);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const groupedAttachments = attachments.reduce(
    (acc, attachment) => {
      if (!acc[attachment.category]) {
        acc[attachment.category] = [];
      }
      acc[attachment.category].push(attachment);
      return acc;
    },
    {} as Record<string, Attachment[]>
  );

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!readOnly && (
        <div className="bg-muted rounded-lg p-6 border-2 border-dashed border-border">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Categoria do Documento
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-background/50 transition-colors p-4 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {uploading ? "Enviando..." : "Clique para enviar ou arraste arquivos"}
              </span>
              <span className="text-xs text-muted-foreground">
                Máximo 10MB por arquivo
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp3,.mp4"
              />
            </label>
          </div>
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-6">
        {Object.entries(groupedAttachments).length > 0 ? (
          Object.entries(groupedAttachments).map(([category, items]) => {
            const categoryInfo = categories.find((c) => c.value === category);
            return (
              <div key={category}>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${categoryInfo?.color}`}>
                    {categoryInfo?.label}
                  </span>
                  <span className="text-muted-foreground">({items.length})</span>
                </h4>
                <div className="space-y-2">
                  {items.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-muted-foreground">
                          {getFileIcon(attachment.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {attachment.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{formatFileSize(attachment.size)}</span>
                            <span>•</span>
                            <span>{formatDate(attachment.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        {attachment.url && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Baixar"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {!readOnly && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => onDelete(attachment.id)}
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum documento anexado</p>
          </div>
        )}
      </div>
    </div>
  );
}
