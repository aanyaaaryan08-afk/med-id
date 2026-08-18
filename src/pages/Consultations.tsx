import { useState, useMemo } from 'react';
import { type Consultation } from '@/types';
import { Card, Badge, SectionTitle, EmptyState } from '@/components/ui';
import {
  Stethoscope,
  Search,
  Calendar,
} from 'lucide-react';

export function Consultations({
  consultations,
}: {
  consultations: Consultation[];
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return consultations.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.doctor.toLowerCase().includes(q) ||
        c.specialization.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q) ||
        c.diagnosis.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || c.specialization.toLowerCase().includes(filter);
      return matchesSearch && matchesFilter;
    });
  }, [consultations, search, filter]);

  const specializations = useMemo(
    () => Array.from(new Set(consultations.map((c) => c.specialization))),
    [consultations]
  );

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Consultations"
        subtitle="All recorded consultations with search and filter"
        icon={<Stethoscope size={18} />}
      />

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor, reason, or diagnosis…"
            className="input pl-11"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input sm:w-56"
        >
          <option value="all">All specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s.toLowerCase()}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Stethoscope size={28} />}
            title="No consultations found"
            message={search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'No consultations have been recorded yet.'}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} hover className="p-5">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
