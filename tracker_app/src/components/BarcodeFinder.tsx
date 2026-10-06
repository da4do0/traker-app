import React, { useState, useRef, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { Btn, CloseBtn, Dot, Modal, useIsDesktop } from "./ui";
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
  const [torch, setTorch] = useState(false);
  const desktop = useIsDesktop();

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
            stream = await navigator.mediaDevices.getUserMedia(constraints[constraintIndex]);
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
          if (!videoRef.current || !canvasRef.current) return;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const video = videoRef.current;
          
          if (!ctx || video.readyState < 2) {
            requestAnimationFrame(scanFromVideo);
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
          requestAnimationFrame(scanFromVideo);
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

  // Torcia: solo dove il browser espone la capability (alcuni Android Chrome)
  const toggleTorch = async () => {
    const track = (videoRef.current?.srcObject as MediaStream | null)?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch } as any] });
      setTorch(!torch);
    } catch {
      console.warn("Torcia non supportata su questo dispositivo");
    }
  };

  // Mirino: angoli bianchi, linea rossa, fuori dal mirino oscurato
  const corners = (
    <>
      {[
        "left-0 top-0 h-1 w-9", "left-0 top-0 h-9 w-1", "right-0 top-0 h-1 w-9", "right-0 top-0 h-9 w-1",
        "bottom-0 left-0 h-1 w-9", "bottom-0 left-0 h-9 w-1", "bottom-0 right-0 h-1 w-9", "bottom-0 right-0 h-9 w-1",
      ].map((c) => <span key={c} className={`absolute rounded-sm bg-ink ${c}`} />)}
      <span className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-signal" />
    </>
  );

  const video = (
    <>
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );

  const status = !isScanning && (
    <p className="t-body-s absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-ink2">{error || "Inizializzazione scanner..."}</p>
  );

  const result = scannedCode && (
    <div>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-signal" />
        <span className="t-label">CODICE LETTO</span>
      </div>
      <p className="t-data-l mt-[13px]">{scannedCode}</p>
      <div className="mt-6 flex items-center gap-4">
        <span className="flex gap-[6px]">
          {[1, 1, 1, 0, 0].map((on, i) => <span key={i} className={`size-[6px] rounded-full ${on ? "bg-ink" : "bg-dotoff"}`} />)}
        </span>
        <span className="t-body-s text-ink2">Cerco il prodotto su OpenFoodFacts…</span>
      </div>
    </div>
  );

  if (desktop) {
    return (
      <Modal onClose={onClose}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="t-title">Scansiona</h2>
            <p className="t-body-s mt-1 text-ink2">Inquadra il codice a barre con la webcam.</p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="relative mt-6 h-[380px] overflow-hidden rounded-3xl bg-void">
          {video}
          <div className="absolute inset-x-[88px] inset-y-[60px]">{corners}</div>
          {status}
        </div>
        <div className="mt-8 min-h-[90px]">{result}</div>
        <div className="mt-4 flex justify-end">
          <Btn kind="secondary" className="!h-12 w-[160px]" onClick={onClose}>Annulla</Btn>
        </div>
      </Modal>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-tile">
      {video}
      <div className="absolute left-1/2 top-[203px] h-[250px] w-[300px] -translate-x-1/2 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">{corners}</div>
      {status}
      <button onClick={onClose} aria-label="Chiudi" className="absolute left-5 top-[13px] flex size-11 cursor-pointer items-center justify-center rounded-full bg-void/60"><X size={20} strokeWidth={1.75} /></button>
      <button onClick={toggleTorch} aria-label="Torcia" aria-pressed={torch} className={`absolute right-5 top-[13px] flex size-11 cursor-pointer items-center justify-center rounded-full ${torch ? "bg-ink text-void" : "bg-void/60"}`}><Zap size={20} strokeWidth={1.75} /></button>
      <div className="absolute inset-x-0 top-[103px] flex flex-col items-center">
        <Dot text="scansiona" p={4.2} />
        <p className="t-body mt-[17px] text-ink2">Inquadra il codice a barre della confezione.</p>
      </div>
      {result && <div className="absolute inset-x-4 top-[593px] rounded-[28px] bg-void px-6 pb-7 pt-6">{result}</div>}
    </div>
  );
};

export default BarcodeFinder;
