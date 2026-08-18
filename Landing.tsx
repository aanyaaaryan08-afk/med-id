import { useState } from 'react';
import { LogoWordmark } from '@/components/Logo';
import { DEMO_MED_ID } from '@/data';
import { searchPatients, fetchPatientPersonalPhone, type PatientSearchResult } from '@/lib/patients';
import { requestOtp, verifyOtp, maskPhone } from '@/lib/otp';
import {
  ArrowRight,
  Siren,
  ShieldCheck,
  Activity,
  Clock,
  Fingerprint,
  Lock,
  Stethoscope,
  AlertTriangle,
  UserCog,
  UserPlus,
  ArrowLeft,
  Smartphone,
  KeyRound,
  Droplet,
  Search,
} from 'lucide-react';

type LoginStep = 'medId' | 'searchResults' | 'otp' | 'verified';

export function Landing({
  onAccess,
  onEmergency,
  onDoctorPortal,
  onRegister,
}: {
  onAccess: (id: string) => void;
  onEmergency: () => void;
  onDoctorPortal: () => void;
  onRegister: () => void;
}) {
  const [loginStep, setLoginStep] = useState<LoginStep>('medId');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const startCountdown = () => {
    setResendCountdown(30);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) {
      setSearchError('Please enter a MED-ID or patient name.');
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      const results = await searchPatients(q);
      if (results.length === 0) {
        setSearchError('No patient found. Try MED-102948 or Aarav Mehta, or create a new account.');
      } else {
        setSearchResults(results);
        setLoginStep('searchResults');
      }
    } catch {
      setSearchError('Search failed. Please try again.');
    }
    setSearching(false);
  };

  const handleSelectPatient = async (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setLoginStep('otp');
    setOtp('');
    setError('');
    await sendOtp(patient);
  };

  const sendOtp = async (patient: PatientSearchResult) => {
    setLoading(true);
    setError('');
    try {
      const phone = await fetchPatientPersonalPhone(patient.medId);
      if (!phone) {
        setError('No phone number on file for this patient.');
        setLoading(false);
        return;
      }
      const result = await requestOtp(patient.medId, phone, 'patient_access');
      if (!result.success) {
        setError(result.error || 'Failed to send OTP.');
        setLoading(false);
        return;
      }
      setDemoMode(result.demoMode);
      setDemoCode(result.demoCode || '');
      setMaskedPhone(maskPhone(phone));
      startCountdown();
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || !selectedPatient) return;
    await sendOtp(selectedPatient);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP code.');
      return;
    }
    if (!selectedPatient) return;
    setLoading(true);
    setError('');
    const result = await verifyOtp(selectedPatient.medId, otp.trim(), 'patient_access');
    if (result.verified) {
      setLoginStep('verified');
      setTimeout(() => onAccess(selectedPatient.medId), 600);
    } else {
      setError(result.error || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const fillDemo = () => setSearchInput(DEMO_MED_ID);

  const resetLogin = () => {
    setLoginStep('medId');
    setSearchInput('');
    setSearchResults([]);
    setSearchError('');
    setSelectedPatient(null);
    setOtp('');
    setError('');
    setMaskedPhone('');
    setDemoCode('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left — hero */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-brand-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 0, transparent 45%)',
        }} />
        <div className="relative flex flex-col h-full px-6 sm:px-12 lg:px-16 py-8 lg:py-12">
          <LogoWordmark className="[&_span]:text-white" />

          <div className="flex-1 flex flex-col justify-center max-w-lg mt-16 lg:mt-0">
            <span className="inline-flex items-center gap-2 self-start text-xs font-semibold bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full mb-6 animate-fade-in">
              <Fingerprint size={14} />
              Science Exhibition Prototype
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight animate-fade-in">
              Your Medical History.
              <br />
              <span className="text-teal-100">One Secure Identity.</span>
            </h1>
            <p className="mt-5 text-teal-50/90 text-base sm:text-lg leading-relaxed animate-fade-in">
              MED-ID is a centralized digital medical-record system. Every patient carries a
              unique identity that lets authorized healthcare professionals instantly access
              critical medical information — anytime, anywhere.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              {[
                { icon: Clock, label: 'Instant access', desc: 'In emergencies' },
                { icon: Activity, label: 'Unified records', desc: 'All in one place' },
                { icon: Lock, label: 'Restricted', desc: 'Authorized only' },
              ].map((f) => (
                <div key={f.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <f.icon size={20} className="text-teal-100" />
                  <p className="mt-2 font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-teal-100/80">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-teal-100/70 mt-8">
            Fictional demo data. Not a real medical service.
          </p>
        </div>
      </div>

      {/* Right — access panel */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-md animate-scale-in">
          <div className="lg:hidden mb-8 flex justify-center">
            <LogoWordmark />
          </div>

          {loginStep === 'medId' && (
            <>
              <h2 className="font-display text-2xl font-bold text-ink-900">Access a Medical Profile</h2>
              <p className="text-ink-500 mt-2 text-sm">
                Enter your MED-ID or full name to receive a verification code on your registered phone.
              </p>

              <form onSubmit={handleSearchSubmit} className="mt-7 space-y-4">
                <div>
                  <label htmlFor="medid" className="label">
                    Patient MED-ID or Full Name
                  </label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      id="medid"
                      type="text"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (searchError) setSearchError('');
                      }}
                      placeholder="e.g. MED-102948 or Aarav Mehta"
                      className="input pl-11"
                      autoComplete="off"
                    />
                  </div>
                  {searchError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 animate-fade-in-fast">
                      <AlertTriangle size={14} />
                      {searchError}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={searching} className="btn-primary w-full">
                  {searching ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Searching…
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Search & Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
                <span className="flex-1 h-px bg-ink-200" />
                OR
                <span className="flex-1 h-px bg-ink-200" />
              </div>

              <button onClick={onRegister} className="btn-secondary w-full">
                <UserPlus size={18} className="text-teal-600" />
                Create New Patient Account
              </button>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={onEmergency} className="btn-secondary w-full">
                  <Siren size={18} className="text-red-500" />
                  Emergency
                </button>
                <button onClick={onDoctorPortal} className="btn-secondary w-full">
                  <UserCog size={18} className="text-teal-600" />
                  Doctor Portal
                </button>
              </div>

              <div className="mt-6 rounded-xl bg-teal-50 border border-teal-100 p-4">
                <div className="flex items-start gap-3">
                  <Stethoscope size={18} className="text-teal-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-teal-800">Try the demo profile</p>
                    <p className="text-teal-700/80 mt-0.5">
                      Search for{' '}
                      <button
                        type="button"
                        onClick={fillDemo}
                        className="font-mono font-bold underline decoration-teal-400 underline-offset-2 hover:text-teal-900"
                      >
                        MED-102948
                      </button>{' '}
                      or{' '}
                      <button
                        type="button"
                        onClick={() => setSearchInput('Aarav Mehta')}
                        className="font-bold underline decoration-teal-400 underline-offset-2 hover:text-teal-900"
                      >
                        Aarav Mehta
                      </button>{' '}
                      to open the fictional record.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {loginStep === 'searchResults' && (
            <>
              <button onClick={resetLogin} className="btn-ghost text-sm text-ink-600 hover:bg-ink-100 mb-4">
                <ArrowLeft size={16} /> Back to Search
              </button>
              <h2 className="font-display text-2xl font-bold text-ink-900">Select Your Profile</h2>
              <p className="text-ink-500 mt-2 text-sm">
                {searchResults.length} patient{searchResults.length > 1 ? 's' : ''} found. Select your profile to receive a verification code.
              </p>

              <div className="mt-5 space-y-3">
                {searchResults.map((patient) => (
                  <div
                    key={patient.medId}
                    className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-4 flex items-center gap-4 hover:shadow-card transition-shadow cursor-pointer"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white font-bold shrink-0">
                      {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-ink-900 truncate">{patient.name}</h3>
                      <p className="text-sm text-ink-500 font-mono">MED-ID: {patient.medId}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-ink-400 flex items-center gap-1"><Droplet size={11} /> {patient.bloodGroup || 'N/A'}</span>
                        <span className="text-xs text-ink-400">DOB: {patient.dob || 'N/A'}</span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-teal-600 shrink-0" />
                  </div>
                ))}
              </div>
            </>
          )}

          {loginStep === 'otp' && selectedPatient && (
            <>
              <button onClick={resetLogin} className="btn-ghost text-sm text-ink-600 hover:bg-ink-100 mb-4">
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="font-display text-2xl font-bold text-ink-900">Verify Your Access</h2>
              <p className="text-ink-500 mt-2 text-sm">
                A one-time password has been sent to your registered phone number.
              </p>
              <div className="mt-3 rounded-xl bg-teal-50 border border-teal-100 p-3 flex items-center gap-2">
                <Smartphone size={16} className="text-teal-600 shrink-0" />
                <p className="text-sm font-semibold text-teal-800">OTP sent to {maskedPhone}</p>
              </div>

              {demoMode && demoCode && (
                <div className="mt-3 rounded-xl bg-amber-50 border-2 border-amber-300 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">DEMO MODE — SMS NOT ENABLED</p>
                  </div>
                  <p className="text-sm text-amber-700">
                    Demo OTP: <span className="font-mono font-bold text-lg tracking-[0.2em] text-amber-900">{demoCode}</span>
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Enter this code above to verify. Real SMS will be sent when an SMS provider is configured.
                  </p>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="otp" className="label">Enter OTP Code</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); if (error) setError(''); }}
                      placeholder="6-digit code"
                      className="input pl-11 font-mono tracking-[0.3em] text-center text-lg"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 animate-fade-in-fast">
                      <AlertTriangle size={14} />
                      {error}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> Verify & Access
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || loading}
                    className={`font-semibold ${resendCountdown > 0 ? 'text-ink-400 cursor-not-allowed' : 'text-teal-700 hover:text-teal-900'}`}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            </>
          )}

          {loginStep === 'verified' && (
            <div className="text-center py-12">
              <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-soft mb-4 animate-scale-in">
                <ShieldCheck size={28} />
              </div>
              <h2 className="font-display text-xl font-bold text-ink-900">Access Verified</h2>
              <p className="text-ink-500 text-sm mt-2">Opening your medical profile…</p>
              <div className="mt-4 inline-block h-8 w-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
          )}

          <div className="mt-6 flex items-start gap-2 text-xs text-ink-400">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            <p>
              This is a science-exhibition prototype using completely fictional data. It is not a
              real medical service and must not be used with real patient information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
