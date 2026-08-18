import { useState } from 'react';
import { DEMO_MED_ID } from '@/data';
import { Card } from '@/components/ui';
import {
  UserCog,
  Fingerprint,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertTriangle,
  Stethoscope,
  KeyRound,
} from 'lucide-react';

export function DoctorAccess({ onAccess }: { onAccess: (id: string) => void }) {
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId.trim() || !patientId.trim()) {
      setError('Both Doctor ID and Patient MED-ID are required.');
      return;
    }
    if (patientId.trim().toUpperCase() !== DEMO_MED_ID) {
      setError('No patient record found for this MED-ID. Try MED-102948.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => onAccess(patientId.trim().toUpperCase()), 900);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
          <UserCog size={18} />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">Doctor Access</h1>
          <p className="text-sm text-ink-500">Authorized Healthcare Professional Access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Form */}
        <Card className="md:col-span-3 p-6">
          <div className="flex items-center gap-2 mb-1 text-teal-700">
            <ShieldCheck size={18} />
            <h2 className="font-display font-bold">Secure Verification</h2>
          </div>
          <p className="text-sm text-ink-500 mb-6">
            Enter your credentials and the patient's MED-ID to access their medical profile.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="docid" className="label">Doctor ID</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="docid"
                  type="text"
                  value={doctorId}
                  onChange={(e) => { setDoctorId(e.target.value); if (error) setError(''); }}
                  placeholder="e.g. DR-7421"
                  className="input pl-11 font-mono"
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label htmlFor="pid" className="label">Patient MED-ID</label>
              <div className="relative">
                <Fingerprint size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="pid"
                  type="text"
                  value={patientId}
                  onChange={(e) => { setPatientId(e.target.value); if (error) setError(''); }}
                  placeholder="e.g. MED-102948"
                  className="input pl-11 font-mono uppercase tracking-wide"
                  autoComplete="off"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1.5 animate-fade-in-fast">
                <AlertTriangle size={14} /> {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying credentials…
                </>
              ) : (
                <>
                  <Lock size={18} /> Authorize & Access Profile
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-ink-100">
            <p className="text-xs text-ink-400">
              Demo: use Doctor ID <span className="font-mono font-semibold text-ink-600">DR-7421</span> and Patient MED-ID{' '}
              <span className="font-mono font-semibold text-ink-600">MED-102948</span>.
            </p>
          </div>
        </Card>

        {/* Info panel */}
        <Card className="md:col-span-2 bg-gradient-to-br from-teal-50 to-brand-50 border-teal-100 p-6">
          <div className="grid place-items-center h-12 w-12 rounded-xl bg-teal-600 text-white mb-4">
            <Stethoscope size={22} />
          </div>
          <h3 className="font-display font-bold text-ink-900">Access Restriction</h3>
          <p className="text-sm text-ink-600 mt-2 leading-relaxed">
            Access should be restricted to authorized healthcare professionals only. In a real
            system, every access would be logged, and patients would be notified when their
            medical profile is viewed.
          </p>
          <div className="mt-5 space-y-3">
            {[
              { icon: Lock, text: 'Credential-based verification' },
              { icon: ShieldCheck, text: 'Audit log of all access' },
              { icon: KeyRound, text: 'Patient consent on record' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-sm text-ink-700">
                <f.icon size={15} className="text-teal-600" />
                {f.text}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-center text-xs text-ink-400 mt-6">
        Fictional prototype. No real authentication is performed.
      </p>
    </div>
  );
}
