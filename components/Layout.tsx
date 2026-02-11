
import React, { useState } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  CalendarClock, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  HandCoins,
  TrendingUp
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Funcionários', icon: Users },
    { id: 'salary_evolution', label: 'Evolução Salarial', icon: TrendingUp },
    { id: 'payroll_config', label: 'Folha Pagamento', icon: FileText },
    { id: 'launches', label: 'Lançar Mensal', icon: CalendarClock },
    { id: 'advances', label: 'Adiantamentos', icon: HandCoins },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">RH Pro</h1>
            </div>
            <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'group-hover:text-slate-100'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 px-4 lg:px-0">
             <h2 className="text-lg font-semibold text-slate-200 lg:hidden">
               {menuItems.find(m => m.id === activeTab)?.label}
             </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-200">Administrador</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest">Acesso Total</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold">
              AD
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
