import { type Consultation } from '@/types';
import { Card, Badge, SectionTitle, EmptyState } from '@/components/ui';
import { GitBranch, Stethoscope, Pill, FlaskConical, StickyNote, Calendar, ArrowRight } from 'lucide-react';

function TimelineEntry({ c, isLast }: { c: Consultation; isLast: boolean }) {
  return (
    <div className="relative pl-10 pb-8 animate-fade-in">
      {/* dot + line */}
      <div className="absolute left-0 top-1.5 flex flex-col items-center">
        <div className="h-5 w-5 rounded-full bg-teal-500 ring-4 ring-teal-100 z-10" />
        {!isLast && <div className="w-0.5 flex-1 bg-ink-200 mt-1" />}
      </div>

      <Card hover className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge tone="teal"><Calendar size={12} /> {c.date}</Badge>
          <Badge tone="blue">{c.specialization}</Badge>
        </div>
        <h3 className="font-display font-bold text-ink-900 text-lg">{c.doctor}</h3>
        <p className="text-sm text-ink-500 mt-0.5">Reason: {c.reason}</p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div className="flex items-start gap-2">
            <Stethoscope size={15} className="text-teal-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Diagnosis</p>
              <p className="text-sm text-ink-700">{c.diagnosis}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Pill size={15} className="text-teal-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Prescription</p>
              <p className="text-sm text-ink-700">{c.prescription}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FlaskConical size={15} className="text-teal-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Tests</p>
              <p className="text-sm text-ink-700">{c.tests}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight size={15} className="text-teal-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Follow-up</p>
              <p className="text-sm text-ink-700">{c.followUp}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 pt-3 border-t border-ink-100">
          <StickyNote size={15} className="text-ink-400 mt-0.5 shrink-0" />
          <p className="text-sm text-ink-600">{c.notes}</p>
        </div>
      </Card>
    </div>
  );
}

export function Timeline({ consultations }: { consultations: Consultation[] }) {
  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Medical Timeline"
        subtitle="Chronological history of consultations and medical events"
        icon={<GitBranch size={18} />}
      />
      {consultations.length === 0 ? (
        <Card>
          <EmptyState
            icon={<GitBranch size={28} />}
            title="No timeline entries yet"
            message="Consultations will appear here in chronological order once recorded."
          />
        </Card>
      ) : (
        <div className="pt-2">
          {consultations.map((c, i) => (
            <TimelineEntry key={c.id} c={c} isLast={i === consultations.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
