import { type Patient, type Consultation, type Allergy, type MedicalCondition, type Medication } from '@/types';
import { Card, Badge, SectionTitle } from '@/components/ui';
import { Droplet, TriangleAlert as AlertTriangle, Pill, Stethoscope, Phone, Calendar, Heart, User, Mail, MapPin, Activity, ArrowUpRight, Fingerprint, ShieldCheck } from 'lucide-react';
import { type PageId } from '@/types';
import { maskPhone } from '@/lib/otp';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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

export function Dashboard({
  patient: p,
  allergies,
  conditions,
  medications,
  latestConsultation,
  onNavigate,
}: {
  patient: Patient;
  allergies: Allergy[];
  conditions: MedicalCondition[];
  medications: Medication[];
  latestConsultation: Consultation | null;
  onNavigate: (page: PageId) => void;
}) {
  const currentMeds = medications.filter((m) => m.status === 'Current');
  const initials = p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const lastCon = latestConsultation;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero card */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative bg-gradient-to-br from-teal-600 to-brand-700 p-6 sm:p-8 text-white sm:w-2/5">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.4) 0, transparent 40%)',
            }} />
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm grid place-items-center text-2xl font-bold border border-white/20">
                  {initials}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold leading-tight">{p.name}</h1>
                  <p className="text-teal-50/90 text-sm font-mono">{p.medId}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip bg-white/15 backdrop-blur-sm border border-white/10">
                  <Droplet size={13} /> {p.bloodGroup}
                </span>
                {p.gender && (
                  <span className="chip bg-white/15 backdrop-blur-sm border border-white/10">
                    <User size={13} /> {p.gender}, {p.age} yrs
                  </span>
                )}
                <span className="chip bg-white/15 backdrop-blur-sm border border-white/10">
                  <Calendar size={13} /> DOB {p.dob}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 sm:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {p.phone && <InfoRow icon={<Phone size={16} />} label="Phone" value={maskPhone(p.phone)} />}
            {p.email && <InfoRow icon={<Mail size={16} />} label="Email" value={p.email} />}
            {p.address && <InfoRow icon={<MapPin size={16} />} label="Address" value={p.address} />}
            <InfoRow icon={<Phone size={16} />} label="Emergency Contact" value={p.emergencyContact.name ? `${p.emergencyContact.name} (${p.emergencyContact.relation})` : 'Not provided'} />
            <InfoRow icon={<Activity size={16} />} label="Last Consultation" value={lastCon ? lastCon.date : 'No consultations yet'} />
            <InfoRow icon={<Fingerprint size={16} />} label="MED-ID Status" value="Active & Verified" />
          </div>
        </div>
      </Card>

      {/* Critical alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover className="border-red-100 bg-red-50/40">
          <div className="flex items-center gap-2 text-red-600 mb-3">
            <AlertTriangle size={18} />
            <h3 className="font-display font-bold">Allergies</h3>
          </div>
          <div className="space-y-2">
            {allergies.length === 0 ? (
              <p className="text-sm text-ink-400">No known allergies.</p>
            ) : (
              allergies.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-800">{a.name}</span>
                  <Badge tone={a.severity === 'Severe' ? 'red' : a.severity === 'Moderate' ? 'amber' : 'slate'}>
                    {a.severity}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card hover>
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

        <Card hover>
          <div className="flex items-center gap-2 text-blue-600 mb-3">
            <Heart size={18} />
            <h3 className="font-display font-bold text-ink-800">Medical Conditions</h3>
          </div>
          <div className="space-y-2">
            {conditions.length === 0 ? (
              <p className="text-sm text-ink-400">No conditions recorded.</p>
            ) : (
              conditions.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink-800 truncate">{c.name}</span>
                  <Badge tone={c.status === 'Active' ? 'amber' : c.status === 'Managed' ? 'teal' : 'green'}>
                    {c.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Last consultation + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Latest Visit"
            icon={<Stethoscope size={18} />}
            action={
              <button onClick={() => onNavigate('consultations')} className="btn-ghost text-sm text-teal-600 hover:bg-teal-50">
                View all <ArrowUpRight size={14} />
              </button>
            }
          />
          {lastCon ? (
            <div className="rounded-xl bg-ink-50 p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge tone="teal"><Calendar size={12} /> {lastCon.date}</Badge>
                <Badge tone="blue">{lastCon.specialization}</Badge>
              </div>
              <p className="font-semibold text-ink-800">{lastCon.doctor}</p>
              <p className="text-sm text-ink-500 mt-0.5">Reason: {lastCon.reason}</p>
              <p className="text-sm text-ink-600 mt-2">
                <span className="font-semibold">Diagnosis:</span> {lastCon.diagnosis}
              </p>
              {lastCon.prescription && lastCon.prescription !== 'None' && (
                <p className="text-sm text-ink-600 mt-1">
                  <span className="font-semibold">Prescription:</span> {lastCon.prescription}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-ink-50 p-4 text-center">
              <Stethoscope size={28} className="mx-auto text-ink-300" />
              <p className="text-sm text-ink-500 mt-2">No consultations recorded yet.</p>
            </div>
          )}
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <ShieldCheck size={18} />
              <h3 className="font-display font-bold text-ink-800">Quick Access</h3>
            </div>
            <p className="text-sm text-ink-500">Jump to any section of the medical profile.</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {([
              ['timeline', 'Timeline'],
              ['medications', 'Medications'],
              ['records', 'Records'],
              ['bracelet', 'Bracelet'],
            ] as [PageId, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="btn-secondary px-3 py-2.5 text-sm"
              >
                {label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-center text-xs text-ink-400 pt-2">
        Prototype using fictional data — MED-ID is a science-exhibition demonstration, not a real medical service.
      </p>
    </div>
  );
}
