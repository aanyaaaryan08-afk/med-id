import { useState } from 'react';
import { LogoWordmark } from '@/components/Logo';
import { createPatient, type RegistrationData } from '@/lib/patients';
import { ArrowRight, ArrowLeft, User, Calendar, Fingerprint, Droplet, TriangleAlert as AlertTriangle, Pill, Heart, Stethoscope, Phone, Smartphone, ShieldAlert, CircleCheck as CheckCircle2, Copy, Check, UserPlus } from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const emptyForm: RegistrationData = {
  name: '',
  dob: '',
  aadhaar: '',
  bloodGroup: '',
  allergies: '',
  currentMedications: '',
  medicalConditions: '',
  previousSurgeries: '',
  personalPhone: '',
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactPhone: '',
  emergencyInfo: '',
};

const steps = [
  { id: 0, label: 'Personal', icon: User },
  { id: 1, label: 'Medical', icon: Heart },
  { id: 2, label: 'Emergency', icon: ShieldAlert },
  { id: 3, label: 'Confirm', icon: CheckCircle2 },
];

export function Register({
  onDone,
  onBack,
}: {
  onDone: (medId: string) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegistrationData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [createdMedId, setCreatedMedId] = useState('');
  const [copied, setCopied] = useState(false);

  const update = (field: keyof RegistrationData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.dob.trim()) e.dob = 'Date of birth is required';
    if (!form.aadhaar.trim()) e.aadhaar = 'Demo Aadhaar number is required';
    else if (!/^\d{12}$/.test(form.aadhaar.trim())) e.aadhaar = 'Aadhaar must be exactly 12 digits';
    if (!form.bloodGroup) e.bloodGroup = 'Blood group is required';
    if (!form.personalPhone.trim()) e.personalPhone = 'Personal phone number is required';
    else if (!/^\d{10}$/.test(form.personalPhone.trim())) e.personalPhone = 'Phone must be exactly 10 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.emergencyContactName.trim()) e.emergencyContactName = 'Emergency contact name is required';
    if (!form.emergencyContactPhone.trim()) e.emergencyContactPhone = 'Emergency contact phone is required';
    else if (!/^\d{10}$/.test(form.emergencyContactPhone.trim())) e.emergencyContactPhone = 'Phone must be exactly 10 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const medId = await createPatient(form);
      setCreatedMedId(medId);
      setStep(4);
    } catch {
      setErrors({ form: 'Failed to create account. Please try again.' });
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  const copyMedId = () => {
    navigator.clipboard?.writeText(createdMedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    onDone(createdMedId);
  };

  // Confirmation screen
  if (step === 4) {
    return (
      <div className="min-h-screen flex flex-col bg-ink-50">
        <div className="px-6 sm:px-8 py-5 flex items-center justify-between">
          <LogoWordmark />
          <button onClick={onBack} className="btn-ghost text-sm text-ink-600 hover:bg-ink-100">
            <ArrowLeft size={16} /> Home
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md text-center animate-scale-in">
            <div className="inline-grid place-items-center h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-card-hover mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink-900">Your MED-ID has been created</h1>
            <p className="text-ink-500 text-sm mt-3">
              Save this ID — you'll need it to access your medical profile from the Patient Portal.
            </p>

            <div className="mt-8 rounded-2xl bg-gradient-to-br from-teal-600 to-brand-700 p-8 text-white shadow-card-hover">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-50/80 mb-2">Your MED-ID</p>
              <div className="flex items-center justify-center gap-3">
                <p className="font-mono text-3xl sm:text-4xl font-extrabold tracking-wider">{createdMedId}</p>
                <button
                  onClick={copyMedId}
                  className="p-2 rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
                  aria-label="Copy MED-ID"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-teal-50 border border-teal-100 p-4 text-left">
              <p className="text-sm text-teal-800 font-semibold">{form.name}</p>
              <p className="text-xs text-teal-600/80 mt-1">
                Blood Group: {form.bloodGroup} · DOB: {form.dob}
              </p>
            </div>

            <button onClick={handleDone} className="btn-primary w-full mt-8">
              <ArrowRight size={18} /> Go to My Medical Profile
            </button>

            <p className="text-xs text-ink-400 mt-4">
              You can also use this MED-ID from the Doctor Portal's patient search.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* Top bar */}
      <div className="px-6 sm:px-8 py-5 flex items-center justify-between">
        <LogoWordmark />
        <button onClick={onBack} className="btn-ghost text-sm text-ink-600 hover:bg-ink-100">
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-grid place-items-center h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-600 to-brand-700 text-white shadow-soft mb-3">
              <UserPlus size={26} />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">Create New Patient Account</h1>
            <p className="text-ink-500 text-sm mt-1">Register a new patient to generate a unique MED-ID</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-6 px-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === i;
              const isComplete = step > i;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`grid place-items-center h-9 w-9 rounded-full text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-soft'
                          : isComplete
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-ink-100 text-ink-400'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-teal-700' : 'text-ink-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${isComplete ? 'bg-teal-400' : 'bg-ink-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form card */}
          <div className="card p-6 sm:p-8">
            {step === 0 && (
              <div className="space-y-4 animate-fade-in-fast">
                <Field label="Full Name" error={errors.name}>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-11" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Priya Sharma" />
                  </div>
                </Field>

                <Field label="Date of Birth" error={errors.dob}>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-11" value={form.dob} onChange={(e) => update('dob', e.target.value)} placeholder="e.g. 15 August 1995" />
                  </div>
                </Field>

                <Field label="Demo Aadhaar Number" error={errors.aadhaar}>
                  <div className="relative">
                    <Fingerprint size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-11 font-mono tracking-wider"
                      value={form.aadhaar}
                      onChange={(e) => update('aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="12-digit fictional number"
                      inputMode="numeric"
                      maxLength={12}
                    />
                  </div>
                  <p className="text-xs text-ink-400 mt-1">Fictional demo only. Do not enter a real Aadhaar number.</p>
                </Field>

                <Field label="Blood Group" error={errors.bloodGroup}>
                  <div className="relative">
                    <Droplet size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 z-10" />
                    <select className="input pl-11" value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)}>
                      <option value="">Select blood group</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </Field>

                <Field label="Personal / OTP Phone Number" error={errors.personalPhone} hint="10-digit Indian mobile number. OTPs for account access will be sent here.">
                  <div className="relative">
                    <Smartphone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-11 font-mono tracking-wider"
                      value={form.personalPhone}
                      onChange={(e) => update('personalPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-fade-in-fast">
                <Field label="Known Allergies" hint="Comma-separated, e.g. Penicillin, Peanuts">
                  <div className="relative">
                    <AlertTriangle size={18} className="absolute left-3.5 top-3 text-ink-400" />
                    <textarea className="input pl-11 min-h-[72px] resize-y" value={form.allergies} onChange={(e) => update('allergies', e.target.value)} placeholder="e.g. Penicillin, Peanuts, or None" />
                  </div>
                </Field>

                <Field label="Current Medications" hint="Comma-separated">
                  <div className="relative">
                    <Pill size={18} className="absolute left-3.5 top-3 text-ink-400" />
                    <textarea className="input pl-11 min-h-[72px] resize-y" value={form.currentMedications} onChange={(e) => update('currentMedications', e.target.value)} placeholder="e.g. Metformin 500mg, or None" />
                  </div>
                </Field>

                <Field label="Major Medical Conditions" hint="Comma-separated">
                  <div className="relative">
                    <Heart size={18} className="absolute left-3.5 top-3 text-ink-400" />
                    <textarea className="input pl-11 min-h-[72px] resize-y" value={form.medicalConditions} onChange={(e) => update('medicalConditions', e.target.value)} placeholder="e.g. Diabetes, Hypertension, or None" />
                  </div>
                </Field>

                <Field label="Previous Surgeries" hint="Comma-separated">
                  <div className="relative">
                    <Stethoscope size={18} className="absolute left-3.5 top-3 text-ink-400" />
                    <textarea className="input pl-11 min-h-[72px] resize-y" value={form.previousSurgeries} onChange={(e) => update('previousSurgeries', e.target.value)} placeholder="e.g. Appendectomy, or None" />
                  </div>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in-fast">
                <Field label="Emergency Contact Name" error={errors.emergencyContactName}>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-11" value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} placeholder="e.g. Rahul Sharma" />
                  </div>
                </Field>

                <Field label="Emergency Contact Relation">
                  <input className="input" value={form.emergencyContactRelation} onChange={(e) => update('emergencyContactRelation', e.target.value)} placeholder="e.g. Brother" />
                </Field>

                <Field label="Emergency Contact Phone" error={errors.emergencyContactPhone} hint="10-digit Indian mobile number. This number will NOT receive OTPs.">
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-11 font-mono tracking-wider"
                      value={form.emergencyContactPhone}
                      onChange={(e) => update('emergencyContactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </Field>

                <Field label="Other Important Emergency Information" hint="Any additional info for first responders">
                  <div className="relative">
                    <ShieldAlert size={18} className="absolute left-3.5 top-3 text-ink-400" />
                    <textarea className="input pl-11 min-h-[72px] resize-y" value={form.emergencyInfo} onChange={(e) => update('emergencyInfo', e.target.value)} placeholder="e.g. Organ donor, pacemaker, etc." />
                  </div>
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in-fast">
                <h3 className="font-display font-bold text-ink-900 mb-2">Review your information</h3>
                <div className="space-y-3 text-sm">
                  <ReviewItem label="Full Name" value={form.name} />
                  <ReviewItem label="Date of Birth" value={form.dob} />
                  <ReviewItem label="Blood Group" value={form.bloodGroup} />
                  <ReviewItem label="Known Allergies" value={form.allergies || 'None'} />
                  <ReviewItem label="Current Medications" value={form.currentMedications || 'None'} />
                  <ReviewItem label="Medical Conditions" value={form.medicalConditions || 'None'} />
                  <ReviewItem label="Previous Surgeries" value={form.previousSurgeries || 'None'} />
                  <ReviewItem label="Personal / OTP Phone" value={form.personalPhone ? '*****' + form.personalPhone.slice(-5) : 'Not provided'} />
                  <ReviewItem label="Emergency Contact" value={`${form.emergencyContactName} (${form.emergencyContactRelation})`} />
                  <ReviewItem label="Emergency Phone" value={form.emergencyContactPhone ? '*****' + form.emergencyContactPhone.slice(-5) : 'Not provided'} />
                  <ReviewItem label="Other Emergency Info" value={form.emergencyInfo || 'None'} />
                </div>
                <p className="text-xs text-ink-400 pt-2 border-t border-ink-100">
                  A unique MED-ID will be generated automatically after you submit.
                </p>
                {errors.form && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {errors.form}
                  </p>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6 pt-5 border-t border-ink-100">
              {step > 0 && step < 4 && (
                <button onClick={prev} className="btn-secondary flex-1">
                  <ArrowLeft size={18} /> Back
                </button>
              )}
              {step < 3 && (
                <button onClick={next} className="btn-primary flex-1">
                  Next <ArrowRight size={18} />
                </button>
              )}
              {step === 3 && (
                <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
                  {saving ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-ink-400 mt-4">
            Fictional prototype. All data is for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-ink-50 last:border-0">
      <span className="font-semibold text-ink-500 shrink-0">{label}</span>
      <span className="text-ink-800 text-right break-words">{value}</span>
    </div>
  );
}
