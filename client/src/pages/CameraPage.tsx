// Aliveo — Camera Page (PRD v2)
// Design: Neo-Museological
//
// Changes from PRD v2:
//   - Chinese copy: "对准展品，按下快门" / "正在识别展品…"
//   - Richer scanning animation with pulsing corner brackets
//   - "唤醒" button label (Chinese)
//   - Loading state shows "正在识别展品…" per PRD

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
      setCameraError("无法访问摄像头，请允许相机权限后重试。");
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

    // Simulate 2-3s recognition per PRD
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1.8;
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
          cameraState === "scanning" ? "blur-[1.5px] brightness-85" : ""
        }`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Dark overlay */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
        cameraState === "scanning" ? "opacity-50" : "opacity-25"
      }`} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-4">
        <button
          onClick={() => setCurrentPage("landing")}
          className="flex items-center gap-2 text-white/90 hover:text-white transition-colors active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-body text-sm tracking-wide">返回</span>
        </button>

        <div className="text-center">
          <span className="font-display text-white/90 text-base font-medium">
            Aliveo<span className="text-[oklch(0.72_0.09_75)]">.</span>
          </span>
        </div>

        <div className="w-16" />
      </div>

      {/* Viewfinder frame */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="relative w-full max-w-[300px] aspect-square">

          {/* Corner brackets — animate during scanning */}
          {(["tl","tr","bl","br"] as const).map(pos => (
            <CornerBracket key={pos} position={pos} scanning={cameraState === "scanning"} />
          ))}

          {/* Scanning line */}
          {cameraState === "scanning" && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[oklch(0.72_0.09_75)] to-transparent"
              style={{ top: `${scanProgress}%`, transition: "top 0.08s linear" }}
            />
          )}

          {/* Center crosshair (idle) */}
          {cameraState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-6 h-6">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50 -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50 -translate-x-1/2" />
                <div className="absolute inset-[6px] rounded-full border border-white/40" />
              </div>
            </div>
          )}

          {/* Scanning overlay */}
          {cameraState === "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-white/15 border-t-[oklch(0.72_0.09_75)] animate-spin" />
                <div className="absolute inset-2 rounded-full border border-white/10 border-b-[oklch(0.72_0.09_75)]/60 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="font-label text-white/90 text-sm tracking-[0.15em]">
                  正在识别展品…
                </p>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-[oklch(0.72_0.09_75)]"
                      style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hint text */}
        {cameraState === "idle" && (
          <p className="absolute bottom-6 left-0 right-0 text-center font-body text-white/55 text-xs tracking-wide">
            对准展品，按下快门
          </p>
        )}
      </div>

      {/* Camera error */}
      {cameraError && (
        <div className="relative z-10 mx-6 mb-4 p-4 bg-black/60 backdrop-blur-sm border border-white/20">
          <p className="font-body text-white/80 text-sm text-center">{cameraError}</p>
          <button
            onClick={startCamera}
            className="mt-3 w-full py-2 border border-white/30 text-white/80 font-body text-xs tracking-widest uppercase hover:bg-white/10 transition-colors"
          >
            重试
          </button>
        </div>
      )}

      {/* Bottom — Shutter button */}
      <div className="relative z-10 flex flex-col items-center gap-3 pb-12 pt-4">
        {/* Progress bar */}
        {cameraState === "scanning" && (
          <div className="w-48 h-px bg-white/20 overflow-hidden mb-1">
            <div
              className="h-full bg-[oklch(0.72_0.09_75)] transition-all duration-100"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        )}

        {/* Shutter button */}
        <button
          onClick={handleAwaken}
          disabled={cameraState !== "idle"}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            cameraState === "idle"
              ? "bg-white hover:scale-105 active:scale-95"
              : "bg-white/40 scale-90 cursor-not-allowed"
          }`}
          style={{
            boxShadow: cameraState === "idle"
              ? "0 0 0 4px rgba(255,255,255,0.2), 0 0 0 8px rgba(255,255,255,0.08)"
              : "none",
          }}
        >
          {cameraState === "idle" ? (
            <div className="w-10 h-10 rounded-full border-2 border-[oklch(0.22_0.01_65)] flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[oklch(0.22_0.01_65)]" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-[oklch(0.22_0.01_65)]/30" />
          )}
        </button>

        {/* Label */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-label text-white/80 text-base tracking-[0.15em]">
            {cameraState === "idle" ? "唤醒" : cameraState === "scanning" ? "识别中…" : "已找到！"}
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

// ── Corner Bracket ────────────────────────────────────────────────────────

function CornerBracket({ position, scanning }: { position: "tl" | "tr" | "bl" | "br"; scanning: boolean }) {
  const posClass = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  }[position];

  return (
    <div
      className={`absolute w-8 h-8 ${posClass} transition-all duration-500`}
      style={{
        borderColor: scanning ? "oklch(0.72 0.09 75)" : "rgba(255,255,255,0.8)",
        filter: scanning ? "drop-shadow(0 0 4px oklch(0.72 0.09 75 / 0.8))" : "none",
      }}
    />
  );
}
