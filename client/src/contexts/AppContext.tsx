// Aliveo — App Context
// Manages navigation state and selected artifact across pages

import React, { createContext, useContext, useState } from "react";
import type { Artifact } from "@/lib/artifacts";

type Page = "landing" | "camera" | "result" | "conversation";

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedArtifact: Artifact | null;
  setSelectedArtifact: (artifact: Artifact | null) => void;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      selectedArtifact,
      setSelectedArtifact,
      capturedImage,
      setCapturedImage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
