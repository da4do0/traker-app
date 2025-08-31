import React, { useState, useRef, useEffect } from "react";
import { X, Camera } from "lucide-react";
import Container from "./container";

interface BarcodeFindProps {
  onClose: () => void;
}

const BarcodeFinder: React.FC<BarcodeFindProps> = ({ onClose }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => {
            console.error("Errore play video:", err);
          });
        }
      }, 100);
    } catch (error) {
      console.error("Errore accesso fotocamera:", error);
      alert("Errore nell'accesso alla fotocamera. Assicurati di aver dato i permessi.");
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center z-50 backdrop-blur-xs">
      <Container css="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900/50 rounded-lg p-2">
              <Camera color="blue" size={18} />
            </div>
            <span className="text-white font-medium">Camera View</span>
          </div>
          <button
            className="text-gray-400 hover:text-white p-1"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        </div>
      </Container>
    </div>
  );
};

export default BarcodeFinder;