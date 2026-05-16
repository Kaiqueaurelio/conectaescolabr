import { useRef, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernLayout";
import { Download, RefreshCw } from "lucide-react";

interface QRCodeAttendanceProps {
  activityId: string;
  activityName: string;
  onGenerate?: (qrData: string) => void;
}

/**
 * QRCodeAttendance - Componente para gerar QR Code para presença
 */
export function QRCodeAttendance({
  activityId,
  activityName,
  onGenerate,
}: QRCodeAttendanceProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    // Gerar QR Code com dados da atividade
    const qrData = JSON.stringify({
      type: "attendance",
      activityId,
      activityName,
      timestamp: new Date().toISOString(),
    });
    setQrValue(qrData);
    onGenerate?.(qrData);
  }, [activityId, activityName, onGenerate]);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `qr-code-${activityId}-${Date.now()}.png`;
      link.click();
    }
  };

  const refreshQR = () => {
    const newQrData = JSON.stringify({
      type: "attendance",
      activityId,
      activityName,
      timestamp: new Date().toISOString(),
    });
    setQrValue(newQrData);
    onGenerate?.(newQrData);
  };

  return (
    <ModernCard className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-2">QR Code de Presença</h3>
          <p className="text-sm text-muted-foreground">
            Atividade: <strong>{activityName}</strong>
          </p>
        </div>

        <div
          ref={qrRef}
          className="flex justify-center p-4 bg-white rounded-lg border border-border"
        >
          {qrValue && (
            <QRCodeCanvas
              value={qrValue}
              size={256}
              level="H"
              includeMargin={true}
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={downloadQR}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar QR Code
          </Button>
          <Button
            onClick={refreshQR}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Escaneie este código para registrar presença
        </p>
      </div>
    </ModernCard>
  );
}

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

/**
 * QRCodeScanner - Componente para escanear QR Code
 */
export function QRCodeScanner({ onScan, onError }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        scanQRCode();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao acessar câmera";
      onError?.(errorMsg);
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsScanning(false);
  };

  const scanQRCode = async () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // Aqui você implementaria a lógica de decodificação do QR Code
      // Para este exemplo, usaremos uma abordagem simplificada
      // Em produção, use a biblioteca jsQR
    }

    requestAnimationFrame(scanQRCode);
  };

  return (
    <ModernCard className="p-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Escanear QR Code</h3>

        {!isScanning ? (
          <Button onClick={startScanning} className="w-full">
            Iniciar Câmera
          </Button>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border border-border"
              style={{ maxHeight: "300px" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <Button onClick={stopScanning} variant="destructive" className="w-full">
              Parar
            </Button>
          </>
        )}

        {scannedData && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success font-medium">Código escaneado com sucesso!</p>
            <p className="text-xs text-success/80 mt-1 break-all">{scannedData}</p>
          </div>
        )}
      </div>
    </ModernCard>
  );
}
