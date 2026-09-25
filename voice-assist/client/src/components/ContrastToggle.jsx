import React from 'react';
import { Eye, Moon, Sun } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export function ContrastToggle({ showAllModes = true }) {
  const { theme, setTheme, toggleContrast, isHighContrast } = useAccessibility();

  if (!showAllModes) {
    return (
      <button
        type="button"
        onClick={toggleContrast}
        aria-label={isHighContrast ? 'Switch to Standard Dark Mode' : 'Switch to WCAG High Contrast Yellow on Black'}
        className={`accessible-button px-5 py-2.5 rounded-2xl border-4 font-black text-accessible-base transition-all ${
          isHighContrast
            ? 'bg-yellow-400 text-black border-black hover:bg-yellow-300'
            : 'bg-yellow-400/20 text-yellow-300 border-yellow-400 hover:bg-yellow-400/30'
        }`}
      >
        <Eye className="w-7 h-7 mr-2" />
        {isHighContrast ? 'Exit High Contrast' : '⚡ High Contrast (AAA)'}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Color Theme Selection"
      className="flex items-center gap-2 p-1.5 rounded-2xl border-2 border-slate-700 bg-slate-900/60"
    >
      {/* High Contrast Mode */}
      <button
        type="button"
        onClick={() => setTheme('high-contrast')}
        aria-pressed={theme === 'high-contrast'}
        className={`px-4 py-2 rounded-xl font-black text-base flex items-center gap-2 transition-all ${
          theme === 'high-contrast'
            ? 'bg-yellow-400 text-black border-2 border-white'
            : 'text-yellow-400 hover:bg-yellow-950/40'
        }`}
      >
        <Eye className="w-5 h-5 stroke-[3]" />
        <span>Yellow/Black</span>
      </button>

      {/* Dark Mode */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        className={`px-4 py-2 rounded-xl font-bold text-base flex items-center gap-2 transition-all ${
          theme === 'dark'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
      >
        <Moon className="w-5 h-5" />
        <span>Dark</span>
      </button>

      {/* Light Mode */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        className={`px-4 py-2 rounded-xl font-bold text-base flex items-center gap-2 transition-all ${
          theme === 'light'
            ? 'bg-white text-slate-900 font-extrabold shadow-md'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
      >
        <Sun className="w-5 h-5" />
        <span>Light</span>
      </button>
    </div>
  );
}

export default ContrastToggle;
