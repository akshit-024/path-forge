import { Database, Info, Map, Network, X, Menu } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { DatabaseStatus } from '../components/DatabaseStatus';
import { useDatabaseStatus } from '../hooks/useDatabaseStatus';

const links = [
  { to: '/planner', label: 'Planner', icon: Map },
  { to: '/graph', label: 'Graph Explorer', icon: Network },
  { to: '/about', label: 'About the Model', icon: Info },
];

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const database = useDatabaseStatus();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 font-bold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl">
        <div className="page-shell flex min-h-16 items-center justify-between gap-4">
          <Brand compact />
          <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold no-underline transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <DatabaseStatus {...database} onRetry={database.retry} />
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {menuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <nav
            id="mobile-navigation"
            className="page-shell grid gap-1 border-t border-slate-100 py-3 md:hidden"
            aria-label="Mobile navigation"
          >
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold ${
                    isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </header>
      {database.status !== 'connected' && database.status !== 'checking' ? (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="page-shell flex items-center gap-2 py-2 text-xs font-semibold text-amber-900">
            <Database size={14} className="shrink-0" aria-hidden="true" />
            <span>{database.message} Live career data may be unavailable.</span>
          </div>
        </div>
      ) : null}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-slate-200 bg-white/70">
        <div className="page-shell flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>PathForge · Explainable career navigation through connected skills.</span>
          <span>Recommendations show their graph evidence.</span>
        </div>
      </footer>
    </div>
  );
}
