import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Cpu, Clock, Upload, Briefcase, BarChart2 } from "lucide-react";

const navItems = [
  { to: "/", label: "Upload", icon: Upload, end: true },
  { to: "/job", label: "Job", icon: Briefcase },
  { to: "/results", label: "Results", icon: BarChart2 },
  { to: "/history", label: "History", icon: Clock },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-acid flex items-center justify-center">
              <Cpu size={16} className="text-ink-950" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              Resume<span className="text-acid">IQ</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-acid/10 text-acid border border-acid/20"
                      : "text-ink-400 hover:text-ink-100 hover:bg-ink-800"
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-800 py-6 text-center text-ink-500 text-sm font-mono">
        ResumeIQ · AI-Powered Resume Analysis · Built with React + Flask + MongoDB
      </footer>
    </div>
  );
}
