import { type Medication } from '@/types';
import { Card, Badge, SectionTitle } from '@/components/ui';
import { Pill, CircleCheck as CheckCircle2, Circle as XCircle, Activity, Calendar, User, Clock } from 'lucide-react';

function MedCard({ m }: { m: Medication }) {
  const statusTone = m.status === 'Current' ? 'green' : m.status === 'Completed' ? 'slate' : 'amber';
  const StatusIcon = m.status === 'Current' ? Activity : m.status === 'Completed' ? CheckCircle2 : XCircle;

  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`grid place-items-center h-11 w-11 rounded-xl shrink-0 ${
            m.status === 'Current' ? 'bg-emerald-50 text-emerald-600' : 'bg-ink-100 text-ink-500'
          }`}>
            <Pill size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-ink-900 truncate">{m.name}</h3>
            <p className="text-sm text-ink-500">{m.reason}</p>
          </div>
        </div>
        <Badge tone={statusTone} className="shrink-0">
          <StatusIcon size={12} /> {m.status}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <User size={14} className="text-ink-400" />
          <span className="text-ink-600 truncate">{m.prescribedBy}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-ink-400" />
          <span className="text-ink-600">{m.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-ink-400" />
          <span className="text-ink-600">{m.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <Pill size={14} className="text-ink-400" />
          <span className="text-ink-600 truncate">{m.dosage}</span>
        </div>
      </div>
    </Card>
  );
}

export function Medications({ medications }: { medications: Medication[] }) {
  const current = medications.filter((m) => m.status === 'Current');
  const previous = medications.filter((m) => m.status !== 'Current');

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Medications"
        subtitle="Current and previous prescriptions"
        icon={<Pill size={18} />}
      />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <h2 className="font-display font-bold text-ink-700">Current Medications</h2>
          <Badge tone="green">{current.length}</Badge>
        </div>
        {current.length === 0 ? (
          <Card><p className="text-sm text-ink-500 py-4 text-center">No current medications.</p></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {current.map((m) => <MedCard key={m.id} m={m} />)}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-ink-300" />
          <h2 className="font-display font-bold text-ink-700">Previous Medications</h2>
          <Badge tone="slate">{previous.length}</Badge>
        </div>
        {previous.length === 0 ? (
          <Card><p className="text-sm text-ink-500 py-4 text-center">No previous medications.</p></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {previous.map((m) => <MedCard key={m.id} m={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
