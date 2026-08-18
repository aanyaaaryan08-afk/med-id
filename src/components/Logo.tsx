import { Fingerprint } from 'lucide-react';

export function LogoWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-teal-600 to-brand-600 text-white shrink-0">
        <Fingerprint size={18} />
      </div>
      <span className="font-display font-extrabold text-xl text-ink-900">
        MED<span className="text-teal-600">-ID</span>
      </span>
    </div>
  );
}
