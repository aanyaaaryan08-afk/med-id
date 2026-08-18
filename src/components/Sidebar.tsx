import { type PageId, type Patient } from '@/types';
import { LogoWordmark } from '@/components/Logo';
import { maskPhone } from '@/lib/otp';
import {
  LayoutDashboard,
  Siren,
  GitBranch,
  Stethoscope,
  Pill,
  FolderHeart,
  UserCog,
  Watch,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'emergency', label: 'Emergency', icon: Siren },
  { id: 'timeline', label: 'Timeline', icon: GitBranch },
  { id: 'consultations', label: 'Consultations', icon: Stethoscope },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'records', label: 'Records', icon: FolderHeart },
  { id: 'doctor-access', label: 'Doctor Access', icon: UserCog },
  { id: 'bracelet', label: 'Bracelet', icon: Watch },
];

export function Sidebar({
  active,
  onNavigate,
  onLogout,
  open,
  onClose,
  patient: p,
}: {
  active: PageId;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
  patient: Patient;
}) {
  const initials = p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in-fast"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 bg-white border-r border-ink-200 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-100">
          <LogoWordmark />
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 rounded-lg text-ink-500 hover:bg-ink-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Patient mini-card */}
        <div className="px-5 py-4 border-b border-ink-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-brand-500 grid place-items-center text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-800 truncate">{p.name}</p>
              <p className="text-xs text-ink-400 font-mono truncate">{p.medId}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-800'
                )}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-teal-600' : 'text-ink-400'}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-ink-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-ink-400">
              Emergency: {p.emergencyContact.name || 'Not set'}
              {p.emergencyContact.phone && ` · ${maskPhone(p.emergencyContact.phone)}`}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
