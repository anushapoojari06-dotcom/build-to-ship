import React, { useState, useEffect } from 'react';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { FormFillerPage } from './pages/FormFillerPage';
import { SimplifierPage } from './pages/SimplifierPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  const { isHighContrast } = useAccessibility();
  const { speak } = useSpeechSynthesis();

  // Handle in-app navigation
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Announce page change to screen reader / TTS
    let pageName = 'Home Voice Assist';
    if (path === '/form-filler') pageName = 'Smart Form Filler';
    if (path === '/simplifier') pageName = 'Document Simplifier';
    if (path === '/history') pageName = 'Voice Task History';
    if (path === '/settings') pageName = 'Accessibility Settings';
    speak(`Navigated to ${pageName}`);
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render current active page
  const renderPage = () => {
    switch (currentPath) {
      case '/form-filler':
        return <FormFillerPage />;
      case '/simplifier':
        return <SimplifierPage />;
      case '/history':
        return <HistoryPage />;
      case '/settings':
        return <SettingsPage />;
      case '/':
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Skip to Main Content Link for WCAG Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-yellow-400 focus:text-black focus:font-black focus:text-2xl focus:rounded-2xl focus:border-4 focus:border-black"
      >
        Skip to main accessibility content
      </a>

      {/* Accessible Header */}
      <Header currentPath={currentPath} onNavigate={navigateTo} />

      {/* Main Page Content */}
      <main id="main-content" className="flex-1 pb-16" tabIndex="-1">
        {renderPage()}
      </main>

      {/* Accessible Footer */}
      <footer
        role="contentinfo"
        className={`w-full py-8 border-t-4 text-center ${
          isHighContrast
            ? 'bg-black border-yellow-400 text-yellow-400'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-black text-xl text-slate-100 dark:text-slate-100">
              VoiceAssist AI — Built for Universal Inclusion
            </p>
            <p className="text-base font-medium opacity-80">
              WCAG 2.1 AAA Compliant • Zero-Friction Voice First
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-base font-bold">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="hover:underline cursor-pointer"
            >
              Voice Assistant
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigateTo('/form-filler')}
              className="hover:underline cursor-pointer"
            >
              Job Form
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigateTo('/simplifier')}
              className="hover:underline cursor-pointer"
            >
              Reader
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigateTo('/settings')}
              className="hover:underline cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
}

export default App;
