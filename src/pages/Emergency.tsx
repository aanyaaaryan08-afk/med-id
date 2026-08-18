import { useState } from 'react';
import type { Patient, Allergy, MedicalCondition, Medication, Surgery } from '@/types';
import { Card, Badge } from '@/components/ui';
import { LogoWordmark } from '@/components/Logo';
import { patientExists, searchPatients, type PatientSearchResult } from '@/lib/patients';
import { maskPhone } from '@/lib/otp';
import { Droplet, TriangleAlert as AlertTriangle, Pill, Heart, Phone, Siren, ArrowLeft, ShieldAlert, Stethoscope, KeyRound, Lock, Fingerprint, ArrowRight, Search, User } from 'lucide-react';

const DEMO_DOCTOR_ID = 'DR-7421';
const DEMO_DOCTOR_PASSWORD = 'med123';

function EmergencyRow({
  icon,
  label,
  children,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-ink-100 last:border-0">
      <div
        className={`grid place-items-center h-10 w-10 rounded-xl shrink-0 ${
          danger ? 'bg-red-100 text-red-600' : 'bg-teal-50 text-teal-600'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

export function EmergencyPage({
  patient: p,
  allergies,
  conditions,
  medications,
  surgeries,
  onEnterMode,
}: {
  patient: Patient;
  allergies: Allergy[];
  conditions: MedicalCondition[];
  medications: Medication[];
  surgeries: Surgery[];
  onEnterMode: () => void;
}) {
  const currentMeds = medications.filter((m) => m.status === 'Current');
  const recentSurgery = surgeries[0];
  const initials = p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Emergency banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-500 to-red-600 p-6 text-white shadow-card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm animate-pulse-ring">
              <Siren size={28} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold">Emergency Information</h1>
              <p className="text-red-50/90 text-sm">
                Critical medical details for first responders and healthcare professionals.
              </p>
            </div>
          </div>
          <button
            onClick={onEnterMode}
            className="btn bg-white text-red-600 px-5 py-3 hover:bg-red-50 active:scale-[0.98] font-bold shadow-soft shrink-0"
          >
            <ShieldAlert size={18} />
            Enter Emergency Mode
          </button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2 pb-4 border-b border-ink-100">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-brand-500 grid place-items-center text-white font-bold">
            {initials}
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-ink-900">{p.name}</h2>
            <p className="text-sm text-ink-500 font-mono">{p.medId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <EmergencyRow icon={<Droplet size={18} />} label="Blood Group" danger>
            <p className="text-2xl font-extrabold text-red-600">{p.bloodGroup}</p>
          </EmergencyRow>

          <EmergencyRow icon={<AlertTriangle size={18} />} label="Known Allergies" danger>
            <div className="flex flex-wrap gap-2">
              {allergies.length === 0 ? (
                <span className="text-sm text-ink-500">No known allergies</span>
              ) : (
                allergies.map((a) => (
                  <Badge key={a.id} tone="red">
                    {a.name} · {a.severity}
                  </Badge>
                ))
              )}
            </div>
          </EmergencyRow>

          <EmergencyRow icon={<Pill size={18} />} label="Current Medications">
            <ul className="space-y-1">
              {currentMeds.length === 0 ? (
                <li className="text-sm text-ink-500">No current medications</li>
              ) : (
                currentMeds.map((m) => (
                  <li key={m.id} className="text-sm font-semibold text-ink-800">
                    {m.name} <span className="text-ink-400 font-normal">— {m.reason}</span>
                  </li>
                ))
              )}
            </ul>
          </EmergencyRow>

          <EmergencyRow icon={<Heart size={18} />} label="Major Medical Conditions">
            <ul className="space-y-1">
              {conditions.length === 0 ? (
                <li className="text-sm text-ink-500">No conditions recorded</li>
              ) : (
                conditions.map((c) => (
                  <li key={c.id} className="text-sm font-semibold text-ink-800">
                    {c.name} <span className="text-ink-400 font-normal">— {c.status}</span>
                  </li>
                ))
              )}
            </ul>
          </EmergencyRow>

          {recentSurgery && (
            <EmergencyRow icon={<Stethoscope size={18} />} label="Recent Surgery">
              <p className="text-sm font-semibold text-ink-800">{recentSurgery.name}</p>
              <p className="text-xs text-ink-500">{recentSurgery.date} · {recentSurgery.hospital}</p>
            </EmergencyRow>
          )}

          <EmergencyRow icon={<Phone size={18} />} label="Emergency Contact" danger>
            <p className="text-sm font-bold text-ink-800">{p.emergencyContact.name || 'Not provided'}</p>
            <p className="text-sm text-ink-600">
              {p.emergencyContact.relation && `${p.emergencyContact.relation} · `}
              {p.emergencyContact.phone ? maskPhone(p.emergencyContact.phone) : 'Not provided'}
            </p>
          </EmergencyRow>
        </div>
      </Card>

      <p className="text-center text-xs text-ink-400">
        This information is fictional and for demonstration purposes only.
      </p>
    </div>
  );
}

export function EmergencyMode({
  patient: p,
  allergies,
  conditions,
  medications,
  surgeries,
  onExit,
}: {
  patient: Patient;
  allergies: Allergy[];
  conditions: MedicalCondition[];
  medications: Medication[];
  surgeries: Surgery[];
  onExit: () => void;
}) {
  const currentMeds = medications.filter((m) => m.status === 'Current');
  const recentSurgery = surgeries[0];
  const initials = p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const rows = [
    { label: 'Blood Group', value: p.bloodGroup, danger: true },
    { label: 'Known Allergies', value: allergies.length > 0 ? allergies.map((a) => a.name).join(', ') : 'None', danger: true },
    { label: 'Current Medications', value: currentMeds.length > 0 ? currentMeds.map((m) => m.name).join(', ') : 'None' },
    { label: 'Major Conditions', value: conditions.length > 0 ? conditions.map((c) => c.name).join(', ') : 'None' },
    ...(recentSurgery ? [{ label: 'Recent Surgery', value: `${recentSurgery.name} (${recentSurgery.date})` }] : []),
    { label: 'Emergency Contact', value: `${p.emergencyContact.name || 'Not provided'} — ${p.emergencyContact.phone ? maskPhone(p.emergencyContact.phone) : 'Not provided'}`, danger: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in-fast">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="bg-red-500 text-white px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-white/15 animate-pulse-ring">
              <Siren size={24} />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-extrabold leading-tight">EMERGENCY MODE</h1>
              <p className="text-red-50/90 text-xs sm:text-sm">Critical medical information</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="btn bg-white text-red-600 px-4 py-2.5 text-sm font-bold hover:bg-red-50 active:scale-[0.98] shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Full Profile</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        {/* Patient identity */}
        <div className="px-5 sm:px-8 py-6 bg-ink-50 border-b border-ink-100">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-brand-500 grid place-items-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-ink-900">{p.name}</h2>
              <p className="text-ink-500 font-mono text-sm">MED-ID: {p.medId}</p>
            </div>
          </div>
        </div>

        {/* Critical info */}
        <div className="flex-1 px-5 sm:px-8 py-6">
          <div className="max-w-2xl mx-auto space-y-3">
            {rows.map((r) => (
              <div
                key={r.label}
                className={`rounded-2xl p-4 sm:p-5 border-2 ${
                  r.danger
                    ? 'border-red-200 bg-red-50'
                    : 'border-ink-200 bg-white'
                }`}
              >
                <p className={`text-xs font-bold uppercase tracking-wider ${r.danger ? 'text-red-500' : 'text-ink-400'}`}>
                  {r.label}
                </p>
                <p className={`mt-1 text-lg sm:text-xl font-extrabold ${r.danger ? 'text-red-700' : 'text-ink-900'}`}>
                  {r.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 sm:px-8 py-4 text-center">
          <button
            onClick={onExit}
            className="btn-secondary"
          >
            <ArrowLeft size={16} />
            Return to Full Medical Profile
          </button>
          <p className="text-xs text-ink-400 mt-3">
            Fictional prototype data. Not a real medical service.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EmergencyAccess({
  onAccess,
  onCancel,
  prefillMedId,
}: {
  onAccess: (medId: string) => void;
  onCancel: () => void;
  prefillMedId?: string;
}) {
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [patientQuery, setPatientQuery] = useState(prefillMedId ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = patientQuery.trim();
    if (!q) {
      setError('Please enter a MED-ID or patient name.');
      return;
    }
    setSearching(true);
    setError('');
    setHasSearched(true);
    try {
      const results = await searchPatients(q);
      setSearchResults(results);
      if (results.length === 0) {
        setError('No patient found. Try MED-102948 or Aarav Mehta.');
      }
    } catch {
      setError('Search failed. Please try again.');
      setSearchResults([]);
    }
    setSearching(false);
  };

  const handleSelectPatient = async (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId.trim() || !password.trim()) {
      setError('Doctor ID and password are required.');
      return;
    }
    if (doctorId.trim().toUpperCase() !== DEMO_DOCTOR_ID || password !== DEMO_DOCTOR_PASSWORD) {
      setError('Invalid doctor credentials. Try DR-7421 / med123.');
      return;
    }
    let medId = '';
    if (selectedPatient) {
      medId = selectedPatient.medId;
    } else {
      const q = patientQuery.trim().toUpperCase();
      const exists = await patientExists(q);
      if (!exists) {
        setError('No patient found. Please search and select a patient first.');
        return;
      }
      medId = q;
    }
    setError('');
    setLoading(true);
    setTimeout(() => onAccess(medId), 700);
  };

  const fillDemo = () => {
    setDoctorId(DEMO_DOCTOR_ID);
    setPassword(DEMO_DOCTOR_PASSWORD);
    setPatientQuery('MED-102948');
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* Top bar */}
      <div className="px-6 sm:px-8 py-5 flex items-center justify-between">
        <LogoWordmark />
        <button onClick={onCancel} className="btn-ghost text-sm text-ink-600 hover:bg-ink-100">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-soft mb-4 animate-pulse-ring">
              <Siren size={28} />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">Emergency Access</h1>
            <p className="text-ink-500 text-sm mt-2">
              Verify your identity and identify the patient to access critical medical information.
            </p>
          </div>

          {/* Form card */}
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1 text-red-600">
              <ShieldAlert size={18} />
              <h2 className="font-display font-bold">Authorized Access Only</h2>
            </div>
            <p className="text-sm text-ink-500 mb-6">
              For emergency situations. All access is logged.
            </p>

            {/* Patient search */}
            <form onSubmit={handleSearch} className="mb-4">
              <label htmlFor="em-patient" className="label">Patient MED-ID or Full Name</label>
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="em-patient"
                  type="text"
                  value={patientQuery}
                  onChange={(e) => { setPatientQuery(e.target.value); if (error) setError(''); setSelectedPatient(null); }}
                  placeholder="e.g. MED-102948 or Aarav Mehta"
                  className="input pl-11"
                  autoComplete="off"
                />
              </div>
              {prefillMedId && !selectedPatient && (
                <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                  <Fingerprint size={12} /> MED-ID pre-filled from QR code scan
                </p>
              )}
              <button type="submit" disabled={searching} className="btn-secondary w-full mt-2 text-sm">
                {searching ? (
                  <>
                    <span className="h-4 w-4 border-2 border-ink-300 border-t-ink-600 rounded-full animate-spin" />
                    Searching…
                  </>
                ) : (
                  <>
                    <Search size={16} /> Search Patient
                  </>
                )}
              </button>
            </form>

            {/* Search results */}
            {hasSearched && !searching && searchResults.length > 0 && !selectedPatient && (
              <div className="space-y-2 mb-4 animate-fade-in">
                <p className="text-xs text-ink-500 font-semibold">
                  {searchResults.length} patient{searchResults.length > 1 ? 's' : ''} found. Select the correct patient:
                </p>
                {searchResults.map((patient) => (
                  <div
                    key={patient.medId}
                    className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-3 flex items-center gap-3 hover:shadow-card transition-shadow cursor-pointer"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white text-sm font-bold shrink-0">
                      {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-ink-900 truncate">{patient.name}</p>
                      <p className="text-xs text-ink-500 font-mono">MED-ID: {patient.medId}</p>
                    </div>
                    <ArrowRight size={16} className="text-teal-600 shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {hasSearched && !searching && searchResults.length === 0 && !selectedPatient && (
              <div className="mb-4 rounded-xl bg-ink-50 border border-ink-200 p-4 text-center">
                <User size={24} className="mx-auto text-ink-300" />
                <p className="text-sm font-semibold text-ink-500 mt-2">Patient not found.</p>
              </div>
            )}

            {/* Selected patient */}
            {selectedPatient && (
              <div className="mb-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white text-sm font-bold shrink-0">
                  {selectedPatient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-ink-900 truncate">{selectedPatient.name}</p>
                  <p className="text-xs text-ink-500 font-mono">MED-ID: {selectedPatient.medId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedPatient(null); setPatientQuery(''); }}
                  className="text-xs text-ink-500 hover:text-red-600 shrink-0"
                >
                  Change
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="em-docid" className="label">Doctor ID</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    id="em-docid"
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
                <label htmlFor="em-pass" className="label">Doctor Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    id="em-pass"
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

              <button type="submit" disabled={loading} className="btn-danger w-full">
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <Siren size={18} /> Access Emergency Profile
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
                  className="font-mono font-semibold text-red-600 underline decoration-red-400 underline-offset-2 hover:text-red-800"
                >
                  DR-7421 / med123 / MED-102948
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
