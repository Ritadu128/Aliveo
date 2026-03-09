// Aliveo — App Root
// Design: Neo-Museological
// Single-page app with custom page state management

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import LandingPage from "./pages/LandingPage";
import CameraPage from "./pages/CameraPage";
import ResultPage from "./pages/ResultPage";
import AwakenPage from "./pages/AwakenPage";
import ConversationPage from "./pages/ConversationPage";

function PageRouter() {
  const { currentPage } = useApp();
  switch (currentPage) {
    case "landing":
      return <LandingPage />;
    case "camera":
      return <CameraPage />;
    case "result":
      return <ResultPage />;
    case "awaken":
      return <AwakenPage />;
    case "conversation":
      return <ConversationPage />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <PageRouter />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
