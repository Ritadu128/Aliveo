// Aliveo — Camera Page
// Design: Neo-Museological
// - Full-screen camera with elegant viewfinder frame
// - Museum-style corner brackets on viewfinder
// - "Awaken" button with pulse ring animation
// - Scanning line during recognition
// - Warm overlay tones

import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { simulateRecognition } from "@/lib/artifacts";

type CameraState = "idle" | "scanning" | "done";

export default function CameraPage() {
  const { setCurrentPage, setSelectedArtifact, setCapturedImage } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Unable to access camera. Please allow camera permission and try again.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  const handleAwaken = () => {
    if (cameraState !== "idle") return;
    setCameraState("scanning");
    setScanProgress(0);

    // Capture frame
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(dataUrl);
      }
    }

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setCameraState("done");
        const { primary } = simulateRecognition();
        setSelectedArtifact(primary);
        setTimeout(() => setCurrentPage("result"), 400);
      }
    }, 50);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
          cameraState === "scanning" ? "blur-[2px] brightness-90" : ""
        }`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Dark overlay */}
      <div className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ${
        cameraState === "scanning" ? "opacity-60" : "opacity-30"
      }`} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-6 pb-4">
        <button
          onClick={() => setCurrentPage("landing")}
          className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-body text-sm tracking-wide">Back</span>
        </button>

        <div className="text-center">
          <span className="font-display text-white/90 text-base font-medium">
            SculptTalk<span className="text-[oklch(0.72_0.09_75)]">.</span>
          </span>
        </div>

        <div className="w-16" />
      </div>

      {/* Viewfinder frame */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="relative w-full max-w-[320px] aspect-square">
          {/* Corner brackets — museum frame aesthetic */}
          <div className="absolute inset-0">
            {/* Top-left */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80" />
            {/* Top-right */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80" />
            {/* Bottom-left */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80" />
            {/* Bottom-right */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80" />
          </div>

          {/* Scanning line */}
          {cameraState === "scanning" && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[oklch(0.72_0.09_75)] to-transparent transition-all duration-100"
              style={{ top: `${scanProgress}%` }}
            />
          )}

          {/* Center dot */}
          {cameraState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>
          )}

          {/* Scanning state overlay */}
          {cameraState === "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {/* Spinning ring */}
              <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[oklch(0.72_0.09_75)] animate-spin" />
              <p className="font-label text-white/90 text-sm tracking-widest">
                Recognizing artifact…
              </p>
            </div>
          )}
        </div>

        {/* Hint text */}
        {cameraState === "idle" && (
          <p className="absolute bottom-8 left-0 right-0 text-center font-body text-white/60 text-xs tracking-wide">
            Align the sculpture inside the frame
          </p>
        )}
      </div>

      {/* Camera error */}
      {cameraError && (
        <div className="relative z-10 mx-6 mb-4 p-4 bg-black/60 backdrop-blur-sm rounded-sm border border-white/20">
          <p className="font-body text-white/80 text-sm text-center">{cameraError}</p>
          <button
            onClick={startCamera}
            className="mt-3 w-full py-2 border border-white/30 text-white/80 font-body text-xs tracking-widest uppercase hover:bg-white/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bottom — Awaken button */}
      <div className="relative z-10 flex flex-col items-center gap-4 pb-12 pt-4">
        {/* Progress bar */}
        {cameraState === "scanning" && (
          <div className="w-48 h-px bg-white/20 overflow-hidden">
            <div
              className="h-full bg-[oklch(0.72_0.09_75)] transition-all duration-100"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        )}

        {/* Awaken button */}
        <button
          onClick={handleAwaken}
          disabled={cameraState !== "idle"}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            cameraState === "idle"
              ? "bg-white animate-pulse-ring hover:scale-105 active:scale-95"
              : "bg-white/50 scale-90"
          }`}
        >
          {cameraState === "idle" ? (
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-8 h-8 rounded-full border-2 border-[oklch(0.22_0.01_65)] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[oklch(0.22_0.01_65)]" />
              </div>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-[oklch(0.22_0.01_65)]/40" />
          )}
        </button>

        {/* Button label */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-label text-white/80 text-base tracking-[0.15em]">
            {cameraState === "idle" ? "Awaken" : cameraState === "scanning" ? "Recognizing…" : "Found!"}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-white/30" />
            <span className="text-[oklch(0.72_0.09_75)] text-xs">✦</span>
            <div className="h-px w-4 bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
