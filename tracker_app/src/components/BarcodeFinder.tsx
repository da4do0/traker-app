import React, { useState, useRef, useEffect } from "react";
import { X, Camera } from "lucide-react";
import Container from "./container";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

interface BarcodeFindProps {
  onClose: () => void;
  onCodeFound?: (code: string) => void; // Nuovo prop per il risultato
}

const BarcodeFinder: React.FC<BarcodeFindProps> = ({
  onClose,
  onCodeFound,
}) => {
  const [scannedCode, setScannedCode] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    const startScanning = async () => {
      if (!videoRef.current) return;

      try {
        setError("");
        setIsScanning(false);
        
        // Prova diverse configurazioni video
        const constraints = [
          { video: { facingMode: "environment" } },
          { video: { facingMode: "user" } },
          { video: true }
        ];
        
        let stream = null;
        let constraintIndex = 0;
        
        while (!stream && constraintIndex < constraints.length) {
          try {
            console.log(`🔄 Tentativo ${constraintIndex + 1} con configurazione:`, constraints[constraintIndex]);
            stream = await navigator.mediaDevices.getUserMedia(constraints[constraintIndex]);
            console.log('✅ Stream ottenuto con successo');
          } catch (streamErr: any) {
            console.warn(`⚠️ Fallito tentativo ${constraintIndex + 1}:`, streamErr.message);
            constraintIndex++;
          }
        }
        
        if (!stream) {
          setError("Impossibile accedere alla fotocamera");
          return;
        }

        // Assegna lo stream al video element
        videoRef.current.srcObject = stream;
        
        // Attendi che il video sia pronto
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = resolve;
        });
        
        setIsScanning(true);
        
        // Scansione continua usando canvas
        const scanFromVideo = async () => {
          let animationId: number;
          if (!videoRef.current || !canvasRef.current) return;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const video = videoRef.current;
          
          if (!ctx || video.readyState < 2) {
            animationId = requestAnimationFrame(scanFromVideo);
            return;
          }
          
          // Imposta dimensioni canvas
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Disegna frame corrente
          ctx.drawImage(video, 0, 0);
          
          try {
            // Crea un'immagine dal canvas per ZXing
            const dataURL = canvas.toDataURL('image/png');
            const img = new Image();
            img.src = dataURL;
            
            await new Promise((resolve) => {
              img.onload = resolve;
            });
            
            // Prova a decodificare dall'immagine
            const result = await codeReader.decodeFromImageElement(img);
            
            if (result) {
              const code = result.getText();
              console.log(`✅ Codice scansionato: ${code}`);
              console.log('📋 Formato:', result.getBarcodeFormat());
              console.log('🔍 Lunghezza:', code.length);
              
              setScannedCode(code);
              onCodeFound?.(code);
              return; // Stop scanning dopo aver trovato un codice
            }
          } catch (scanError) {
            if (!(scanError instanceof NotFoundException)) {
              console.warn('⚠️ Errore scansione:', scanError);
            }
          }
          
          // Continua la scansione
          animationId = requestAnimationFrame(scanFromVideo);
        };
        
        // Avvia la scansione
        scanFromVideo();
        
      } catch (err: any) {
        console.error('❌ Errore inizializzazione scanner:', err);
        setIsScanning(false);
        
        if (err.name === 'NotAllowedError') {
          setError("Permesso fotocamera negato. Abilita l'accesso alla fotocamera.");
        } else if (err.name === 'NotFoundError') {
          setError("Nessuna fotocamera trovata sul dispositivo.");
        } else if (err.name === 'NotReadableError') {
          setError("Fotocamera occupata da un'altra applicazione.");
        } else {
          setError(`Errore: ${err.message || "Errore sconosciuto"}`);
        }
      }
    };

    // Avvia la scansione dopo un breve delay
    const timer = setTimeout(startScanning, 100);

    return () => {
      clearTimeout(timer);
      if (codeReader) {
        codeReader.reset();
      }
      
      // Ferma il video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      setIsScanning(false);
    };
  }, [onCodeFound]);

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
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-center">
                <Camera size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">
                  {error || "Inizializzazione scanner..."}
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute bottom-2 left-2 right-2 p-2 bg-red-900/80 rounded text-white text-xs text-center">
              {error}
            </div>
          )}
        </div>

        {/* Risultato scansione */}
        {scannedCode && (
          <div className="mt-4 p-3 bg-green-900/50 rounded-lg border border-green-600">
            <p className="text-green-300 text-sm mb-1">Codice scansionato:</p>
            <code className="text-white font-mono text-lg">{scannedCode}</code>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BarcodeFinder;
