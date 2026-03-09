// Aliveo — Recognition Result Page (PRD v2)
// Design: Neo-Museological
//
// Changes from PRD v2:
//   - Chinese copy throughout
//   - 【就是这个】→ conversation, 【重新选择】→ camera
//   - "不是这个？试试这些：" for alternatives
//   - Search placeholder: "搜索展品名称"

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { ARTIFACTS, searchArtifacts } from "@/lib/artifacts";
import type { Artifact } from "@/lib/artifacts";

export default function ResultPage() {
  const { setCurrentPage, selectedArtifact, setSelectedArtifact } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Artifact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [matchConfidence] = useState(94);

  const alternatives = ARTIFACTS.filter(a => a.id !== selectedArtifact?.id).slice(0, 3);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setSearchResults(searchArtifacts(searchQuery));
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  if (!selectedArtifact) {
    setCurrentPage("camera");
    return null;
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.012_80)] flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[oklch(0.97_0.012_80)]/95 backdrop-blur-sm border-b border-[oklch(0.88_0.01_75)] px-5 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage("camera")}
            className="flex items-center gap-1.5 text-[oklch(0.45_0.01_65)] hover:text-[oklch(0.22_0.01_65)] transition-colors active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 3L5 9L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1 text-center">
            <p className="exhibit-label text-[oklch(0.72_0.09_75)] mb-0.5">识别结果</p>
          </div>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-8">
        {/* Primary artifact card */}
        <div className="animate-fade-up">
          {/* Match confidence */}
          <div className="flex items-center justify-between mb-3">
            <p className="exhibit-label text-[oklch(0.55_0.012_70)]">最佳匹配</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-4 rounded-sm ${
                      i < Math.round(matchConfidence / 20)
                        ? "bg-[oklch(0.72_0.09_75)]"
                        : "bg-[oklch(0.88_0.01_75)]"
                    }`}
                  />
                ))}
              </div>
              <span className="font-label text-xs text-[oklch(0.55_0.012_70)]">{matchConfidence}%</span>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm border border-[oklch(0.88_0.01_75)]">
            {/* Artifact image */}
            <div className="relative h-[360px] bg-[oklch(0.93_0.008_75)] overflow-hidden">
              <img
                src={selectedArtifact.image}
                alt={selectedArtifact.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/60 to-transparent" />
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-2.5 py-1">
                <span className="exhibit-label text-[0.65rem] text-[oklch(0.45_0.01_65)]">
                  {selectedArtifact.catalogNumber}
                </span>
              </div>
            </div>

            {/* Info section */}
            <div className="p-5">
              <div className="h-px w-10 bg-[oklch(0.72_0.09_75)] mb-4" />
              <h2 className="font-display text-2xl font-semibold text-[oklch(0.22_0.01_65)] leading-tight mb-2">
                {selectedArtifact.name}
              </h2>
              <p className="exhibit-label text-[oklch(0.55_0.012_70)] mb-1">
                {selectedArtifact.artist} · {selectedArtifact.year}
              </p>
              <p className="font-label text-sm text-[oklch(0.45_0.01_65)] italic mb-1">
                {selectedArtifact.medium}
              </p>
              <p className="font-body text-xs text-[oklch(0.55_0.012_70)]">
                {selectedArtifact.location}
              </p>
              <p className="font-body text-sm text-[oklch(0.45_0.01_65)] mt-3 leading-relaxed">
                {selectedArtifact.description}
              </p>
            </div>

            {/* CTA buttons — PRD v2: 就是这个 + 重新选择 */}
            <div className="px-5 pb-5 flex flex-col gap-3">
              <button
                onClick={() => setCurrentPage("awaken")}
                className="w-full py-3.5 bg-[oklch(0.22_0.01_65)] text-white font-body font-medium text-sm tracking-widest uppercase hover:bg-[oklch(0.35_0.01_65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              >
                ✦ 就是这个
              </button>
              <button
                onClick={() => setCurrentPage("camera")}
                className="w-full py-3 border border-[oklch(0.88_0.01_75)] text-[oklch(0.45_0.01_65)] font-body font-medium text-sm tracking-widest uppercase hover:border-[oklch(0.72_0.09_75)] hover:text-[oklch(0.22_0.01_65)] transition-all duration-200 active:scale-[0.98]"
              >
                重新选择
              </button>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        <div className="animate-fade-up-delay-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-4 bg-[oklch(0.72_0.09_75)]/40" />
            <p className="exhibit-label text-[oklch(0.55_0.012_70)]">不是这个？试试这些：</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {alternatives.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => setSelectedArtifact(artifact)}
                className="flex-shrink-0 w-[140px] bg-white overflow-hidden shadow-sm border border-[oklch(0.88_0.01_75)] hover:border-[oklch(0.72_0.09_75)] transition-all duration-200 hover:-translate-y-1 text-left active:scale-[0.97]"
              >
                <div className="h-[140px] overflow-hidden bg-[oklch(0.93_0.008_75)]">
                  <img
                    src={artifact.image}
                    alt={artifact.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2.5">
                  <div className="h-px w-4 bg-[oklch(0.72_0.09_75)] mb-2" />
                  <p className="font-display text-xs font-semibold text-[oklch(0.22_0.01_65)] leading-tight mb-1 line-clamp-2">
                    {artifact.name}
                  </p>
                  <p className="exhibit-label text-[0.6rem] text-[oklch(0.55_0.012_70)]">
                    {artifact.year}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="animate-fade-up-delay-3 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-4 bg-[oklch(0.72_0.09_75)]/40" />
            <p className="exhibit-label text-[oklch(0.55_0.012_70)]">搜索展品</p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索展品名称…"
              className="w-full px-4 py-3 bg-white border border-[oklch(0.88_0.01_75)] font-body text-sm text-[oklch(0.22_0.01_65)] placeholder-[oklch(0.7_0.008_70)] focus:outline-none focus:border-[oklch(0.72_0.09_75)] transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <div className="w-4 h-4 rounded-full border border-[oklch(0.72_0.09_75)] border-t-transparent animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[oklch(0.7_0.008_70)]">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-[oklch(0.88_0.01_75)] overflow-hidden shadow-md">
              {searchResults.map((artifact, i) => (
                <button
                  key={artifact.id}
                  onClick={() => {
                    setSelectedArtifact(artifact);
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[oklch(0.94_0.025_75)] transition-colors ${
                    i > 0 ? "border-t border-[oklch(0.88_0.01_75)]" : ""
                  }`}
                >
                  <div className="w-10 h-10 overflow-hidden flex-shrink-0 bg-[oklch(0.93_0.008_75)]">
                    <img src={artifact.image} alt={artifact.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-medium text-[oklch(0.22_0.01_65)]">{artifact.name}</p>
                    <p className="exhibit-label text-[0.6rem] text-[oklch(0.55_0.012_70)]">{artifact.artist} · {artifact.year}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="mt-2 px-4 py-3 bg-white border border-[oklch(0.88_0.01_75)]">
              <p className="font-body text-sm text-[oklch(0.55_0.012_70)] text-center">未找到相关展品</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
