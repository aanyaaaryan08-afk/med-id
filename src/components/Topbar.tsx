import { type PageId } from '@/types';
import { Menu, Siren } from 'lucide-react';

const pageLabels: Record<PageId, string> = {
  dashboard: 'Dashboard',
  emergency: 'Emergency',
  timeline: 'Timeline',
  consultations: 'Consultations',
  medications: 'Medications',
  records: 'Records',
  'doctor-access': 'Doctor Access',
  bracelet: 'Bracelet',
};

export function Topbar({
  page,
  onMenu,
  onEmergency,
}: {
  page: PageId;
  onMenu: () => void;
  onEmergency: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-ink-100">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenu}
            className="lg:hidden p-2 -ml-2 rounded-lg text-ink-600 hover:bg-ink-100"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h2 className="font-display font-bold text-ink-900 truncate">
            {pageLabels[page]}
          </h2>
        </div>
        <button
          onClick={onEmergency}
          className="btn-danger px-4 py-2 text-sm animate-pulse-ring"
        >
          <Siren size={16} />
          <span className="hidden sm:inline">Emergency</span>
        </button>
      </div>
    </header>
  );
}
