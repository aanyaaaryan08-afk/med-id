import { useState } from 'react';
import { LogoWordmark } from '@/components/Logo';
import { UserCog, KeyRound, Lock, ArrowRight, ArrowLeft, TriangleAlert as AlertTriangle, Fingerprint, ShieldCheck } from 'lucide-react';

const DEMO_DOCTOR_ID = 'DR-7421';
const DEMO_DOCTOR_PASSWORD = 'med123';

export function DoctorLogin({
  onLogin,
  onBack,
}: {
  onLogin: (doctorId: string) => void;
  onBack: () => void;
}) {
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId.trim() || !password.trim()) {
      setError('Both Doctor ID and password are required.');
      return;
    }
    if (doctorId.trim().toUpperCase() !== DEMO_DOCTOR_ID || password !== DEMO_DOCTOR_PASSWORD) {
      setError('Invalid credentials. Try DR-7421 / med123.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => onLogin(doctorId.trim().toUpperCase()), 700);
  };

  const fillDemo = () => {
    setDoctorId(DEMO_DOCTOR_ID);
    setPassword(DEMO_DOCTOR_PASSWORD);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* Top bar */}
      <div className="px-6 sm:px-8 py-5 flex items-center justify-between">
        <LogoWordmark />
        <button
          onClick={onBack}
          className="btn-ghost text-sm text-ink-600 hover:bg-ink-100"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-600 to-brand-700 text-white shadow-soft mb-4">
              <UserCog size={28} />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">Doctor Portal</h1>
            <p className="text-ink-500 text-sm mt-2">
              Sign in with your Doctor ID to access patient medical records.
            </p>
          </div>

          {/* Form card */}
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1 text-teal-700">
              <ShieldCheck size={18} />
              <h2 className="font-display font-bold">Secure Sign-In</h2>
            </div>
            <p className="text-sm text-ink-500 mb-6">
              Authorized healthcare professionals only. All access is logged.
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
                    className="input pl-11 font-mono tracking-wide uppercase"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="docpass" className="label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    id="docpass"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                    placeholder="Enter your password"
                    className="input pl-11"
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
                    Signing in…
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} /> Sign In to Doctor Portal
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-ink-100">
              <p className="text-xs text-ink-400">
                Demo credentials:{' '}
                <button
                  type="button"
                  onClick={fillDemo}
                  className="font-mono font-semibold text-teal-700 underline decoration-teal-400 underline-offset-2 hover:text-teal-900"
                >
                  DR-7421 / med123
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-ink-400 mt-6">
            Fictional prototype. No real authentication is performed.
          </p>
        </div>
      </div>
    </div>
  );
}
