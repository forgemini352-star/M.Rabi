import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BarcodeDisplayProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'QR';
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 42,
  displayValue = true,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!value) return;

    if (format === 'QR') {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          value,
          {
            width: height * 1.8,
            margin: 1,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          },
          (err) => {
            if (err) console.error('QR code render error:', err);
          }
        );
      }
    } else {
      if (svgRef.current) {
        try {
          JsBarcode(svgRef.current, value, {
            format: 'CODE128',
            width,
            height,
            displayValue,
            font: 'JetBrains Mono, monospace',
            fontSize: 11,
            textMargin: 2,
            margin: 4,
            background: 'transparent',
            lineColor: '#0f172a',
          });
        } catch (e) {
          console.warn('Barcode render error, fallback standard:', e);
        }
      }
    }
  }, [value, format, width, height, displayValue]);

  if (!value) {
    return <span className="text-xs text-slate-400">No barcode</span>;
  }

  if (format === 'QR') {
    return <canvas ref={canvasRef} className={`rounded ${className}`} />;
  }

  return <svg ref={svgRef} className={`max-w-full ${className}`} />;
};
