import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { LogoWordmark } from '@/components/Logo';
import { Card, Badge } from '@/components/ui';
import { fetchConsultations, insertConsultation } from '@/lib/consultations';
import { categorizeConsultation, searchPatients, fetchPatient, fetchPatientPersonalPhone, type PatientSearchResult, type PatientRecords } from '@/lib/patients';
import { requestOtp, verifyOtp, maskPhone } from '@/lib/otp';
import type { Consultation } from '@/types';
import {
  Search,
  Plus,
  X,
  Stethoscope,
  Calendar,
  Pill,
  Droplet,
  Heart,
  User,
  Phone,
  Mail,
  MapPin,
  Fingerprint,
  LogOut,
  UserCog,
  Siren,
  Menu,
  ArrowLeft,
  Smartphone,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

const emptyForm = {
  doctor: '',
  specialization: '',
  date: '',
  reason: '',
  diagnosis: '',
  prescription: '',
  tests: '',
  notes: '',
  followUp: '',
};

type AccessStep = 'search' | 'otp' | 'verified' | 'record';

export function DoctorDashboard({
  doctorId,
  onLogout,
  onEmergency,
}: {
  doctorId: string;
  onLogout: () => void;
  onEmergency: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [accessStep, setAccessStep] = useState<AccessStep>('search');
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const [patientRecords, setPatientRecords] = useState<PatientRecords | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setSearchError('Please enter a MED-ID or patient name.');
      return;
    }
    setSearching(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const results = await searchPatients(q);
      setSearchResults(results);
    } catch {
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAccessNow = async (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setAccessStep('otp');
    setOtp('');
    setOtpError('');
    await sendOtp(patient);
  };

  const sendOtp = async (patient: PatientSearchResult) => {
    setSendLoading(true);
    setOtpError('');
    try {
      const phone = await fetchPatientPersonalPhone(patient.medId);
      if (!phone) {
        setOtpError('No phone number on file for this patient.');
        setSendLoading(false);
        return;
      }
      const result = await requestOtp(patient.medId, phone, 'doctor_access');
      if (!result.success) {
        setOtpError(result.error || 'Failed to send OTP.');
        setSendLoading(false);
        return;
      }
      setDemoMode(result.demoMode);
      setDemoCode(result.demoCode || '');
      setMaskedPhone(maskPhone(phone));
      startCountdown();
    } catch {
      setOtpError('Failed to send OTP. Please try again.');
    }
    setSendLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || !selectedPatient) return;
    await sendOtp(selectedPatient);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setOtpError('Please enter the OTP code.');
      return;
    }
    if (!selectedPatient) return;
    setOtpLoading(true);
    setOtpError('');
    const result = await verifyOtp(selectedPatient.medId, otp.trim(), 'doctor_access');
    if (result.verified) {
      setAccessStep('verified');
      await loadPatientRecord(selectedPatient.medId);
    } else {
      setOtpError(result.error || 'Invalid OTP. Please try again.');
    }
    setOtpLoading(false);
  };

  const loadPatientRecord = async (medId: string) => {
    setLoadingRecord(true);
    try {
      const records = await fetchPatient(medId);
      if (records) {
        setPatientRecords(records);
      }
      const cons = await fetchConsultations(medId);
      setConsultations(cons);
      setAccessStep('record');
    } catch {
      setOtpError('Failed to load patient record.');
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleBackToSearch = () => {
    setAccessStep('search');
    setSelectedPatient(null);
    setOtp('');
    setOtpError('');
    setMaskedPhone('');
    setDemoCode('');
    setPatientRecords(null);
    setConsultations([]);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.doctor.trim()) e.doctor = 'Doctor name is required';
    if (!form.specialization.trim()) e.specialization = 'Specialization is required';
    if (!form.date.trim()) e.date = 'Date is required';
    if (!form.reason.trim()) e.reason = 'Reason for visit is required';
    if (!form.diagnosis.trim()) e.diagnosis = 'Diagnosis is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedPatient) return;
    setSaving(true);
    try {
      const consultation: Consultation = {
        id: '',
        date: form.date,
        doctor: form.doctor,
        specialization: form.specialization,
        reason: form.reason,
        diagnosis: form.diagnosis,
        prescription: form.prescription || 'None',
        tests: form.tests || 'None',
        notes: form.notes || 'No additional notes.',
        followUp: form.followUp || 'Not required',
      };
      await insertConsultation(selectedPatient.medId, {
        date: consultation.date,
        doctor: consultation.doctor,
        specialization: consultation.specialization,
        reason: consultation.reason,
        diagnosis: consultation.diagnosis,
        prescription: consultation.prescription,
        tests: consultation.tests,
        notes: consultation.notes,
        followUp: consultation.followUp,
      });
      await categorizeConsultation(selectedPatient.medId, consultation);
      setForm(emptyForm);
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      await loadPatientRecord(selectedPatient.medId);
    } catch {
      setErrors({ form: 'Failed to save consultation. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
  };

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showForm]);

  const currentMeds = useMemo(() => patientRecords?.medications.filter((m) => m.status === 'Current') ?? [], [patientRecords]);

  // OTP verification screen
  if (accessStep === 'otp' && selectedPatient) {
    return (
      <div className="min-h-screen bg-ink-50 flex flex-col">
        <div className="px-6 sm:px-8 py-5 flex items-center justify-between">
          <LogoWordmark />
          <button onClick={handleBackToSearch} className="btn-ghost text-sm text-ink-600 hover:bg-ink-100">
            <ArrowLeft size={16} /> Back to Search
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md animate-scale-in">
            <div className="text-center mb-8">
              <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-600 to-brand-700 text-white shadow-soft mb-4">
                <ShieldCheck size={28} />
              </div>
              <h1 className="font-display text-2xl font-extrabold text-ink-900">Verify Patient Access</h1>
              <p className="text-ink-500 text-sm mt-2">
                A one-time password has been sent to the patient's registered phone number.
              </p>
            </div>

            <div className="card p-6 sm:p-8">
              <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 flex items-center gap-2 mb-4">
                <Smartphone size={16} className="text-teal-600 shrink-0" />
                <p className="text-sm font-semibold text-teal-800">OTP sent to {maskedPhone}</p>
              </div>

              {demoMode && demoCode && (
                <div className="rounded-xl bg-amber-50 border-2 border-amber-300 p-4 mb-4">
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

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="label">Enter OTP Code</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); if (otpError) setOtpError(''); }}
                      placeholder="6-digit code"
                      className="input pl-11 font-mono tracking-[0.3em] text-center text-lg"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                  </div>
                  {otpError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 animate-fade-in-fast">
                      <AlertTriangle size={14} /> {otpError}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={otpLoading} className="btn-primary w-full">
                  {otpLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> Verify OTP
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || sendLoading}
                    className={`font-semibold ${resendCountdown > 0 ? 'text-ink-400 cursor-not-allowed' : 'text-teal-700 hover:text-teal-900'}`}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            </div>

            <p className="text-center text-xs text-ink-400 mt-6">
              Patient: {selectedPatient.name} · {selectedPatient.medId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen after OTP verified
  if (accessStep === 'verified') {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-soft mb-4 animate-scale-in">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="font-display text-xl font-bold text-ink-900">Access Verified</h2>
          <p className="text-ink-500 text-sm mt-2">Loading patient medical record…</p>
          <div className="mt-4 inline-block h-8 w-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Patient record view (after OTP verified)
  if (accessStep === 'record' && selectedPatient && patientRecords) {
    const p = patientRecords.patient;
    const initials = p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
      <div className="min-h-screen bg-ink-50 flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in-fast" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Doctor sidebar */}
        <aside className={`fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 bg-white border-r border-ink-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center justify-between px-5 h-16 border-b border-ink-100">
            <LogoWordmark />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 -mr-2 rounded-lg text-ink-500 hover:bg-ink-100" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
          <div className="px-5 py-4 border-b border-ink-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-brand-500 grid place-items-center text-white shrink-0">
                <UserCog size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-800 truncate">Doctor Portal</p>
                <p className="text-xs text-ink-400 font-mono truncate">{doctorId}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
            <button onClick={handleBackToSearch} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors">
              <Search size={18} className="text-ink-400" />
              <span>New Patient Search</span>
            </button>
          </nav>
          <div className="p-3 border-t border-ink-100 space-y-1">
            <button onClick={onEmergency} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <Siren size={18} />
              <span>Emergency Access</span>
            </button>
            <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-ink-100">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-ink-600 hover:bg-ink-100" aria-label="Open menu">
                  <Menu size={22} />
                </button>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-ink-900 truncate">Patient Medical Record</h2>
                  <p className="text-xs text-ink-500 truncate">{p.name} · {p.medId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleBackToSearch} className="btn-secondary px-4 py-2 text-sm">
                  <ArrowLeft size={16} /> <span className="hidden sm:inline">New Search</span>
                </button>
                <button onClick={onEmergency} className="btn-danger px-4 py-2 text-sm animate-pulse-ring">
                  <Siren size={16} />
                  <span className="hidden sm:inline">Emergency</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl w-full mx-auto space-y-6">
            {loadingRecord ? (
              <div className="py-20 text-center">
                <div className="inline-block h-10 w-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                <p className="text-sm text-ink-500 mt-3">Loading medical record…</p>
              </div>
            ) : (
              <>
                {/* Patient header */}
                <Card className="overflow-hidden p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative bg-gradient-to-br from-teal-600 to-brand-700 p-6 sm:p-8 text-white sm:w-2/5">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.4) 0, transparent 40%)' }} />
                      <div className="relative">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm grid place-items-center text-2xl font-bold border border-white/20 shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h1 className="font-display text-2xl font-extrabold leading-tight truncate">{p.name}</h1>
                            <p className="text-teal-50/90 text-sm font-mono">{p.medId}</p>
                          </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                          <span className="chip bg-white/15 backdrop-blur-sm border border-white/10"><Droplet size={13} /> {p.bloodGroup}</span>
                          {p.gender && <span className="chip bg-white/15 backdrop-blur-sm border border-white/10"><User size={13} /> {p.gender}, {p.age} yrs</span>}
                          <span className="chip bg-white/15 backdrop-blur-sm border border-white/10"><Calendar size={13} /> DOB {p.dob}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 sm:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      {p.phone && <InfoRow icon={<Phone size={16} />} label="Phone" value={maskPhone(p.phone)} />}
                      {p.email && <InfoRow icon={<Mail size={16} />} label="Email" value={p.email} />}
                      {p.address && <InfoRow icon={<MapPin size={16} />} label="Address" value={p.address} />}
                      <InfoRow icon={<Phone size={16} />} label="Emergency Contact" value={p.emergencyContact.name ? `${p.emergencyContact.name} (${p.emergencyContact.relation})` : 'Not provided'} />
                    </div>
                  </div>
                </Card>

                {/* Critical alerts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-red-100 bg-red-50/40">
                    <div className="flex items-center gap-2 text-red-600 mb-3">
                      <AlertTriangle size={18} />
                      <h3 className="font-display font-bold">Allergies</h3>
                    </div>
                    <div className="space-y-2">
                      {patientRecords.allergies.length === 0 ? (
                        <p className="text-sm text-ink-400">No known allergies.</p>
                      ) : (
                        patientRecords.allergies.map((a) => (
                          <div key={a.id} className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-ink-800 truncate">{a.name}</span>
                            <Badge tone={a.severity === 'Severe' ? 'red' : a.severity === 'Moderate' ? 'amber' : 'slate'} className="shrink-0">{a.severity}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                  <Card>
                    <div className="flex items-center gap-2 text-teal-600 mb-3">
                      <Pill size={18} />
                      <h3 className="font-display font-bold text-ink-800">Current Medications</h3>
                    </div>
                    <div className="space-y-2">
                      {currentMeds.length === 0 ? (
                        <p className="text-sm text-ink-400">No current medications.</p>
                      ) : (
                        currentMeds.map((m) => (
                          <div key={m.id} className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-ink-800 truncate">{m.name}</span>
                            <span className="text-xs text-ink-400 shrink-0">{m.dosage}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                  <Card>
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                      <Heart size={18} />
                      <h3 className="font-display font-bold text-ink-800">Medical Conditions</h3>
                    </div>
                    <div className="space-y-2">
                      {patientRecords.conditions.length === 0 ? (
                        <p className="text-sm text-ink-400">No conditions recorded.</p>
                      ) : (
                        patientRecords.conditions.map((c) => (
                          <div key={c.id} className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-ink-800 truncate">{c.name}</span>
                            <Badge tone={c.status === 'Active' ? 'amber' : c.status === 'Managed' ? 'teal' : 'green'} className="shrink-0">{c.status}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Consultation history */}
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                        <Stethoscope size={18} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-lg font-bold text-ink-900 truncate">Consultation History</h2>
                        <p className="text-sm text-ink-500">All recorded consultations for this patient</p>
                      </div>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2.5 text-sm shrink-0">
                      <Plus size={18} /> Add Consultation
                    </button>
                  </div>

                  {success && (
                    <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 animate-fade-in-fast">
                      <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                      <p className="text-sm font-semibold text-emerald-800">
                        Consultation saved successfully. It is now visible in the patient's timeline, consultation list, and relevant medical records.
                      </p>
                    </div>
                  )}

                  {consultations.length === 0 ? (
                    <div className="py-10 text-center">
                      <Stethoscope size={28} className="mx-auto text-ink-300" />
                      <p className="text-sm text-ink-500 mt-3">No consultations recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {consultations.map((c) => (
                        <div key={c.id} className="rounded-xl border border-ink-200 p-4 hover:shadow-card transition-shadow">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge tone="teal"><Calendar size={12} /> {c.date}</Badge>
                            <Badge tone="blue">{c.specialization}</Badge>
                          </div>
                          <h3 className="font-display font-bold text-ink-900">{c.doctor}</h3>
                          <p className="text-sm text-ink-500 mt-0.5">{c.reason}</p>
                          <div className="mt-3 space-y-1.5 text-sm">
                            <p className="text-ink-700"><span className="font-semibold text-ink-500">Diagnosis:</span> {c.diagnosis}</p>
                            <p className="text-ink-700"><span className="font-semibold text-ink-500">Prescription:</span> {c.prescription}</p>
                            <p className="text-ink-700"><span className="font-semibold text-ink-500">Tests:</span> {c.tests}</p>
                            <p className="text-ink-700"><span className="font-semibold text-ink-500">Follow-up:</span> {c.followUp}</p>
                          </div>
                          {c.notes !== 'No additional notes.' && (
                            <p className="text-sm text-ink-600 mt-2 pt-2 border-t border-ink-100">{c.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}
          </main>
        </div>

        {/* Add consultation modal */}
        {showForm && createPortal(
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in-fast" onClick={closeForm} />
            <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto scrollbar-thin bg-white rounded-t-3xl sm:rounded-2xl shadow-card-hover animate-scale-in">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-ink-100 flex items-center justify-between z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <Stethoscope size={20} className="text-teal-600 shrink-0" />
                  <h2 className="font-display font-bold text-lg text-ink-900 truncate">Add Consultation</h2>
                </div>
                <button onClick={closeForm} className="p-2 -mr-2 rounded-lg text-ink-500 hover:bg-ink-100 shrink-0">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Doctor Name" error={errors.doctor}>
                    <input className="input" value={form.doctor} onChange={(e) => handleChange('doctor', e.target.value)} placeholder="Dr. …" />
                  </Field>
                  <Field label="Specialization" error={errors.specialization}>
                    <input className="input" value={form.specialization} onChange={(e) => handleChange('specialization', e.target.value)} placeholder="e.g. Cardiologist" />
                  </Field>
                  <Field label="Consultation Date" error={errors.date}>
                    <input type="date" className="input" value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
                  </Field>
                  <Field label="Follow-up Date">
                    <input type="date" className="input" value={form.followUp} onChange={(e) => handleChange('followUp', e.target.value)} />
                  </Field>
                </div>

                <Field label="Symptoms / Reason for Visit" error={errors.reason}>
                  <input className="input" value={form.reason} onChange={(e) => handleChange('reason', e.target.value)} placeholder="e.g. Chest pain" />
                </Field>
                <Field label="Diagnosis" error={errors.diagnosis}>
                  <input className="input" value={form.diagnosis} onChange={(e) => handleChange('diagnosis', e.target.value)} placeholder="e.g. Gastritis" />
                </Field>
                <Field label="Prescription">
                  <textarea className="input min-h-[80px] resize-y" value={form.prescription} onChange={(e) => handleChange('prescription', e.target.value)} placeholder="Medications and dosage…" />
                </Field>
                <Field label="Tests Performed">
                  <input className="input" value={form.tests} onChange={(e) => handleChange('tests', e.target.value)} placeholder="e.g. CBC, X-Ray" />
                </Field>
                <Field label="Doctor's Notes">
                  <textarea className="input min-h-[80px] resize-y" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Clinical notes and advice…" />
                </Field>

                {errors.form && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {errors.form}
                  </p>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={closeForm} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Save Consultation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Default: search screen
  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in-fast" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Doctor sidebar */}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 bg-white border-r border-ink-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-100">
          <LogoWordmark />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 -mr-2 rounded-lg text-ink-500 hover:bg-ink-100" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 border-b border-ink-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-brand-500 grid place-items-center text-white shrink-0">
              <UserCog size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-800 truncate">Doctor Portal</p>
              <p className="text-xs text-ink-400 font-mono truncate">{doctorId}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          <button onClick={() => { setSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-teal-50 text-teal-700">
            <Search size={18} className="text-teal-600" />
            <span>Patient Search</span>
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-500" />
          </button>
        </nav>
        <div className="p-3 border-t border-ink-100 space-y-1">
          <button onClick={onEmergency} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <Siren size={18} />
            <span>Emergency Access</span>
          </button>
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-ink-100">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-ink-600 hover:bg-ink-100" aria-label="Open menu">
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-ink-900 truncate">Doctor Portal</h2>
                <p className="text-xs text-ink-500 truncate">Search and manage patient records</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full">
                <UserCog size={14} /> {doctorId}
              </div>
              <button onClick={onEmergency} className="btn-danger px-4 py-2 text-sm animate-pulse-ring">
                <Siren size={16} />
                <span className="hidden sm:inline">Emergency</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl w-full mx-auto space-y-6">
          {/* Patient search */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                <Search size={18} />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl font-bold text-ink-900">Patient Search</h1>
                <p className="text-sm text-ink-500">Search by MED-ID or patient name to access their medical profile</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (searchError) setSearchError(''); }}
                  placeholder="e.g. MED-102948 or Aarav Mehta"
                  className="input pl-11"
                  autoComplete="off"
                />
              </div>
              <button type="submit" disabled={searching} className="btn-primary sm:w-auto">
                {searching ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Searching…
                  </>
                ) : (
                  <>
                    <Search size={18} /> Search Patient
                  </>
                )}
              </button>
            </form>

            {searchError && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5 animate-fade-in-fast">
                <AlertTriangle size={14} /> {searchError}
              </p>
            )}

            <div className="mt-4 rounded-xl bg-teal-50 border border-teal-100 p-3">
              <p className="text-xs text-teal-700">
                Demo: search for <span className="font-mono font-bold">MED-102948</span> or <span className="font-bold">Aarav Mehta</span> to find the demo patient. Newly registered patients are also searchable.
              </p>
            </div>
          </Card>

          {/* Search results */}
          {hasSearched && !searching && (
            <div className="space-y-4 animate-fade-in">
              {searchResults.length === 0 ? (
                <Card className="p-8 text-center">
                  <User size={32} className="mx-auto text-ink-300" />
                  <p className="text-sm font-semibold text-ink-500 mt-3">Patient not found.</p>
                </Card>
              ) : (
                <>
                  <p className="text-sm text-ink-500">
                    {searchResults.length} patient{searchResults.length > 1 ? 's' : ''} found. Click ACCESS NOW to verify and view the medical record.
                  </p>
                  {searchResults.map((patient) => (
                    <div
                      key={patient.medId}
                      className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-card transition-shadow"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white font-bold shrink-0">
                          {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-lg text-ink-900 truncate">{patient.name}</h3>
                          <p className="text-sm text-ink-500 font-mono">MED-ID: {patient.medId}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge tone="teal"><Droplet size={12} /> {patient.bloodGroup || 'N/A'}</Badge>
                            <span className="text-xs text-ink-400">DOB: {patient.dob || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAccessNow(patient)}
                        disabled={sendLoading}
                        className="btn-primary px-5 py-2.5 text-sm shrink-0"
                      >
                        {sendLoading ? (
                          <>
                            <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Sending OTP…
                          </>
                        ) : (
                          <>
                            <Fingerprint size={18} /> ACCESS NOW
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="grid place-items-center h-9 w-9 rounded-lg bg-ink-50 text-ink-500 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-ink-800 break-words">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
