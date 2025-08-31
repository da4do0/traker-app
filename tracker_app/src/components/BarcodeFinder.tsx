import React, { useState, useRef, useEffect } from "react";
import { X, Camera } from "lucide-react";
import Container from "./container";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeFindProps {
  onClose: () => void;
  onCodeFound?: (code: string) => void; // Nuovo prop per il risultato
}

const BarcodeFinder: React.FC<BarcodeFindProps> = ({ onClose, onCodeFound }) => {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [scannedCode, setScannedCode] = useState<string>("");
  const scannerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Inizializza lo scanner quando il componente si monta
    const initScanner = () => {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "scanner-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          supportedScanTypes: [0, 1],
          rememberLastUsedCamera: true,
        },
        false
      );

      // Avvia il rendering dello scanner
      html5QrcodeScanner.render(
        // Success callback
        (decodedText, decodedResult) => {
          console.log(`Codice scansionato: ${decodedText}`);
          setScannedCode(decodedText);
          onCodeFound?.(decodedText);
        },
        // Error callback
        (error) => {
          // Errori normali durante la scansione - non loggare
        }
      );

      setScanner(html5QrcodeScanner);
    };

    // Delay per assicurarsi che il DOM sia pronto
    const timer = setTimeout(() => {
      if (scannerRef.current && !scanner) {
        initScanner();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(error => {
          console.error("Errore durante la pulizia dello scanner:", error);
        });
      }
    };
  }, []); // Dipendenze vuote

  return (
    <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center z-50 backdrop-blur-xs">
      <Container css="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900/50 rounded-lg p-2">
              <Camera color="blue" size={18} />
            </div>
            <span className="text-white font-medium">Barcode Scanner</span>
          </div>
          <button
            className="text-gray-400 hover:text-white p-1"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scanner Container */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <div 
            id="scanner-container"
            ref={scannerRef}
            className="w-full"
          />
        </div>

        {/* Risultato scansione */}
        {scannedCode && (
          <div className="mt-4 p-3 bg-green-900/50 rounded-lg border border-green-600">
            <p className="text-green-300 text-sm mb-1">Codice scansionato:</p>
            <code className="text-white font-mono text-lg">
              {scannedCode}
            </code>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BarcodeFinder;
