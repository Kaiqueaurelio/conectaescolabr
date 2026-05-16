import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ColorItem {
  name: string;
  hex: string;
  hsl: string;
  description: string;
}

const colors: ColorItem[] = [
  {
    name: "Verde Esmeralda",
    hex: "#01965c",
    hsl: "162° 98% 30%",
    description: "Cor primária - Esperança e crescimento",
  },
  {
    name: "Laranja Vibrante",
    hex: "#f08900",
    hsl: "30° 100% 47%",
    description: "Cor secundária - Energia e entusiasmo",
  },
  {
    name: "Azul Royal",
    hex: "#0f71b8",
    hsl: "213° 88% 38%",
    description: "Cor terciária - Confiança e profissionalismo",
  },
  {
    name: "Vermelho Coral",
    hex: "#e53c15",
    hsl: "11° 90% 49%",
    description: "Cor de destaque - Ação e urgência",
  },
];

export function ColorPalette() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, color: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Paleta de Cores
        </h1>
        <p className="text-muted-foreground">
          Cores institucionais da Associação Camila
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colors.map((color) => (
          <div
            key={color.hex}
            className="rounded-2xl overflow-hidden shadow-soft-lg hover:shadow-soft-xl transition-shadow"
          >
            {/* Color Preview */}
            <div
              className="h-32 w-full"
              style={{ backgroundColor: color.hex }}
            />

            {/* Color Info */}
            <div className="p-6 bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {color.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {color.description}
              </p>

              {/* Color Values */}
              <div className="space-y-3">
                {/* HEX */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">HEX</p>
                    <p className="font-mono font-semibold text-foreground">
                      {color.hex}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(color.hex, `hex-${color.hex}`)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                    title="Copiar HEX"
                  >
                    {copiedColor === `hex-${color.hex}` ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* HSL */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">HSL</p>
                    <p className="font-mono font-semibold text-foreground">
                      {color.hsl}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(color.hsl, `hsl-${color.hex}`)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                    title="Copiar HSL"
                  >
                    {copiedColor === `hsl-${color.hex}` ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* RGB */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">RGB</p>
                    <p className="font-mono font-semibold text-foreground">
                      {color.hex === "#01965c"
                        ? "1, 150, 92"
                        : color.hex === "#f08900"
                          ? "240, 137, 0"
                          : color.hex === "#0f71b8"
                            ? "15, 113, 184"
                            : "229, 60, 21"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        color.hex === "#01965c"
                          ? "1, 150, 92"
                          : color.hex === "#f08900"
                            ? "240, 137, 0"
                            : color.hex === "#0f71b8"
                              ? "15, 113, 184"
                              : "229, 60, 21",
                        `rgb-${color.hex}`
                      )
                    }
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                    title="Copiar RGB"
                  >
                    {copiedColor === `rgb-${color.hex}` ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient Preview */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Gradientes Institucionais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gradient Brand */}
          <div className="rounded-2xl overflow-hidden shadow-soft-lg">
            <div
              className="h-32 w-full"
              style={{
                background:
                  "linear-gradient(120deg, #01965c 0%, #0f71b8 35%, #f08900 70%, #e53c15 100%)",
              }}
            />
            <div className="p-6 bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Gradiente Brand
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                linear-gradient(120deg, #01965c 0%, #0f71b8 35%, #f08900 70%,
                #e53c15 100%)
              </p>
            </div>
          </div>

          {/* Gradient Hero */}
          <div className="rounded-2xl overflow-hidden shadow-soft-lg">
            <div
              className="h-32 w-full"
              style={{
                background:
                  "linear-gradient(135deg, #01965c 0%, #0f71b8 50%, #f08900 100%)",
              }}
            />
            <div className="p-6 bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Gradiente Hero
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                linear-gradient(135deg, #01965c 0%, #0f71b8 50%, #f08900 100%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
