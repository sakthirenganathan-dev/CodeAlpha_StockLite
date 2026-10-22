import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  PieChart, 
  History, 
  HelpCircle,
  Database
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'holdings' | 'analytics' | 'activity' | 'api-docs';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  holdingsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  holdingsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'holdings' as ActiveTab,
      label: 'Holdings',
      icon: Layers,
      badge: holdingsCount > 0 ? holdingsCount : null,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Asset Allocation',
      icon: PieChart,
      badge: null,
    },
    {
      id: 'activity' as ActiveTab,
      label: 'Activity Log',
      icon: History,
      badge: null,
    },
    {
      id: 'api-docs' as ActiveTab,
      label: 'API & Reference',
      icon: Database,
      badge: 'Demo',
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 bg-navy-950/90 md:bg-navy-950/50 backdrop-blur-md border-r border-navy-700/60 p-4 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          
          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/5 text-white border-l-4 border-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={isActive ? 'text-emerald-400' : 'text-slate-400'}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                        isActive
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : 'bg-navy-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Card / System Information */}
          <div className="p-3.5 rounded-2xl bg-navy-850/80 border border-navy-700/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <HelpCircle size={14} className="text-brand-400" />
                Data Integrity
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Holdings are securely stored in your browser's LocalStorage and evaluated with INR pricing rules.
            </p>
            <div className="pt-1 border-t border-navy-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Stack: React + FastAPI</span>
              <span className="text-emerald-400 font-mono">v1.0.0</span>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};
