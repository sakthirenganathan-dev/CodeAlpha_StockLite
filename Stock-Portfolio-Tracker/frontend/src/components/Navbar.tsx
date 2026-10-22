import React from 'react';
import { 
  TrendingUp, 
  Plus, 
  Server, 
  FileDown, 
  Info,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  backendOnline: boolean;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendOnline,
  onOpenAddModal,
  onExportCSV,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-navy-950/80 backdrop-blur-md border-b border-navy-700/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
                <div className="h-full w-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    Portfolio<span className="text-emerald-400">Tracker</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    DEMO DATA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Illustrative Reference Prices in INR (₹)
                </p>
              </div>
            </div>
          </div>

          {/* Center Info / Notice (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-navy-850/80 border border-navy-700/50 text-xs text-slate-300">
            <Info size={14} className="text-brand-400 shrink-0" />
            <span>Reference Prices: AAPL ₹180, TSLA ₹250, GOOGL ₹170, MSFT ₹420, AMZN ₹190</span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Backend Connectivity Indicator */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                backendOnline 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' 
                  : 'bg-navy-850 text-slate-400 border-navy-700'
              }`}
              title={backendOnline ? 'Connected to FastAPI backend calculation service' : 'Operating in Standalone client mode with local calculation engine'}
            >
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <Server size={13} className="text-slate-400" />
              <span className="hidden md:inline">{backendOnline ? 'FastAPI Connected' : 'Standalone Mode'}</span>
            </div>

            {/* Currency Pill */}
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-700 text-xs font-mono font-medium text-slate-300">
              INR (₹)
            </div>

            {/* Export CSV button */}
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 hover:border-slate-600 transition-all shadow-sm"
              title="Download portfolio breakdown as CSV"
            >
              <FileDown size={14} className="text-slate-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Add Stock CTA */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-navy-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Add Stock</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
