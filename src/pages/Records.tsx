import { useState, useMemo } from 'react';
import type { Allergy, MedicalCondition, Surgery, Test, ConsultationItem, ItemCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { Card, Badge } from '@/components/ui';
import { FolderHeart, TriangleAlert as AlertTriangle, Heart, Stethoscope, FlaskConical, Pill, Activity, Syringe, Lightbulb, CalendarClock, FileText, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'allergies' | 'conditions' | 'surgeries' | 'tests' | 'consultation_items';

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof AlertTriangle;
  count: number;
}

export function Records({
  allergies,
  conditions,
  surgeries,
  tests,
  consultationItems,
}: {
  allergies: Allergy[];
  conditions: MedicalCondition[];
  surgeries: Surgery[];
  tests: Test[];
  consultationItems: ConsultationItem[];
}) {
  const [active, setActive] = useState<TabId>('allergies');

  const tabs: TabDef[] = useMemo(() => {
    const allTabs: TabDef[] = [
      { id: 'allergies', label: 'Allergies', icon: AlertTriangle, count: allergies.length },
      { id: 'conditions', label: 'Conditions', icon: Heart, count: conditions.length },
      { id: 'surgeries', label: 'Surgeries', icon: Stethoscope, count: surgeries.length },
      { id: 'tests', label: 'Tests', icon: FlaskConical, count: tests.length },
      { id: 'consultation_items', label: 'Consultation Records', icon: Boxes, count: consultationItems.length },
    ];
    return allTabs.filter((t) => t.count > 0);
  }, [allergies, conditions, surgeries, tests, consultationItems]);

  const activeTab = tabs.find((t) => t.id === active);

  if (tabs.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
            <FolderHeart size={18} />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">Medical Records</h1>
            <p className="text-sm text-ink-500">Allergies, conditions, surgeries & tests</p>
          </div>
        </div>
        <Card>
          <p className="text-sm text-ink-500 py-8 text-center">No medical records recorded yet.</p>
        </Card>
      </div>
    );
  }

  const currentTab = activeTab ?? tabs[0];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
          <FolderHeart size={18} />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">Medical Records</h1>
          <p className="text-sm text-ink-500">Allergies, conditions, surgeries & tests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentTab.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200',
                isActive
                  ? 'bg-teal-600 text-white shadow-soft'
                  : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
              )}
            >
              <Icon size={16} />
              {t.label}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', isActive ? 'bg-white/20' : 'bg-ink-100 text-ink-500')}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-fade-in-fast" key={currentTab.id}>
        {currentTab.id === 'allergies' && <AllergiesTab allergies={allergies} />}
        {currentTab.id === 'conditions' && <ConditionsTab conditions={conditions} />}
        {currentTab.id === 'surgeries' && <SurgeriesTab surgeries={surgeries} />}
        {currentTab.id === 'tests' && <TestsTab tests={tests} />}
        {currentTab.id === 'consultation_items' && <ConsultationItemsTab items={consultationItems} />}
      </div>
    </div>
  );
}

function RecordCard({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function AllergiesTab({ allergies }: { allergies: Allergy[] }) {
  if (allergies.length === 0) {
    return <Card><p className="text-sm text-ink-500 py-8 text-center">No known allergies recorded.</p></Card>;
  }
  return (
    <RecordCard>
      {allergies.map((a) => (
        <Card key={a.id} hover className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-red-50 text-red-600 shrink-0">
                <AlertTriangle size={18} />
              </div>
              <h3 className="font-display font-bold text-ink-900 truncate">{a.name}</h3>
            </div>
            <Badge tone={a.severity === 'Severe' ? 'red' : a.severity === 'Moderate' ? 'amber' : 'slate'} className="shrink-0">
              {a.severity}
            </Badge>
          </div>
          {a.reaction && <p className="text-sm text-ink-500 mt-3">Reaction: {a.reaction}</p>}
        </Card>
      ))}
    </RecordCard>
  );
}

function ConditionsTab({ conditions }: { conditions: MedicalCondition[] }) {
  if (conditions.length === 0) {
    return <Card><p className="text-sm text-ink-500 py-8 text-center">No medical conditions recorded.</p></Card>;
  }
  return (
    <RecordCard>
      {conditions.map((c) => (
        <Card key={c.id} hover className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Heart size={18} />
              </div>
              <h3 className="font-display font-bold text-ink-900 truncate">{c.name}</h3>
            </div>
            <Badge tone={c.status === 'Active' ? 'amber' : c.status === 'Managed' ? 'teal' : 'green'} className="shrink-0">
              {c.status}
            </Badge>
          </div>
          {c.diagnosedDate && <p className="text-xs text-ink-400 mt-3">Diagnosed: {c.diagnosedDate}</p>}
          {c.notes && <p className="text-sm text-ink-600 mt-1">{c.notes}</p>}
        </Card>
      ))}
    </RecordCard>
  );
}

function SurgeriesTab({ surgeries }: { surgeries: Surgery[] }) {
  if (surgeries.length === 0) {
    return <Card><p className="text-sm text-ink-500 py-8 text-center">No surgeries recorded.</p></Card>;
  }
  return (
    <RecordCard>
      {surgeries.map((s) => (
        <Card key={s.id} hover className="p-5">
          <div className="flex items-center gap-3 mb-3 min-w-0">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <Stethoscope size={18} />
            </div>
            <h3 className="font-display font-bold text-ink-900 truncate">{s.name}</h3>
          </div>
          <div className="space-y-1 text-sm">
            {s.date && <p className="text-ink-600"><span className="font-semibold text-ink-400">Date:</span> {s.date}</p>}
            {s.hospital && <p className="text-ink-600"><span className="font-semibold text-ink-400">Hospital:</span> {s.hospital}</p>}
            {s.surgeon && <p className="text-ink-600"><span className="font-semibold text-ink-400">Surgeon:</span> {s.surgeon}</p>}
            {s.outcome && <p className="text-ink-600"><span className="font-semibold text-ink-400">Outcome:</span> {s.outcome}</p>}
          </div>
        </Card>
      ))}
    </RecordCard>
  );
}

function TestsTab({ tests }: { tests: Test[] }) {
  if (tests.length === 0) {
    return <Card><p className="text-sm text-ink-500 py-8 text-center">No tests recorded.</p></Card>;
  }
  return (
    <RecordCard>
      {tests.map((t) => (
        <Card key={t.id} hover className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                <FlaskConical size={18} />
              </div>
              <h3 className="font-display font-bold text-ink-900 truncate">{t.name}</h3>
            </div>
            <Badge tone={t.status === 'Normal' ? 'green' : t.status === 'Abnormal' ? 'amber' : 'slate'} className="shrink-0">
              {t.status}
            </Badge>
          </div>
          <div className="space-y-1 text-sm mt-3">
            {t.date && <p className="text-ink-600"><span className="font-semibold text-ink-400">Date:</span> {t.date}</p>}
            {t.type && <p className="text-ink-600"><span className="font-semibold text-ink-400">Type:</span> {t.type}</p>}
            {t.result && <p className="text-ink-600"><span className="font-semibold text-ink-400">Result:</span> {t.result}</p>}
          </div>
        </Card>
      ))}
    </RecordCard>
  );
}

const ITEM_ICONS: Partial<Record<ItemCategory, typeof AlertTriangle>> = {
  imaging: Activity,
  lab_test: FlaskConical,
  medication: Pill,
  diagnosis: FileText,
  condition: Heart,
  allergy: AlertTriangle,
  procedure: Stethoscope,
  vaccination: Syringe,
  recommendation: Lightbulb,
  follow_up: CalendarClock,
  other: Boxes,
};

const ITEM_TONES: Partial<Record<ItemCategory, 'red' | 'amber' | 'teal' | 'blue' | 'green' | 'slate'>> = {
  imaging: 'teal',
  lab_test: 'teal',
  medication: 'green',
  diagnosis: 'blue',
  condition: 'blue',
  allergy: 'red',
  procedure: 'teal',
  vaccination: 'green',
  recommendation: 'amber',
  follow_up: 'slate',
  other: 'slate',
};

function ConsultationItemsTab({ items }: { items: ConsultationItem[] }) {
  if (items.length === 0) {
    return <Card><p className="text-sm text-ink-500 py-8 text-center">No consultation records yet.</p></Card>;
  }

  const grouped = new Map<ItemCategory, ConsultationItem[]>();
  for (const item of items) {
    const bucket = grouped.get(item.category) ?? [];
    bucket.push(item);
    grouped.set(item.category, bucket);
  }

  const categoryOrder: ItemCategory[] = [
    'imaging', 'lab_test', 'medication', 'diagnosis', 'condition',
    'allergy', 'procedure', 'vaccination', 'recommendation', 'follow_up', 'other',
  ];

  return (
    <div className="space-y-6">
      {categoryOrder.map((cat) => {
        const catItems = grouped.get(cat);
        if (!catItems || catItems.length === 0) return null;
        const Icon = ITEM_ICONS[cat] ?? Boxes;
        const tone = ITEM_TONES[cat] ?? 'slate';
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className="text-ink-500" />
              <h2 className="font-display font-bold text-ink-700">{CATEGORY_LABELS[cat]}</h2>
              <Badge tone={tone}>{catItems.length}</Badge>
            </div>
            <RecordCard>
              {catItems.map((item) => (
                <Card key={item.id} hover className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('grid place-items-center h-10 w-10 rounded-xl shrink-0', toneBg(tone))}>
                        <Icon size={18} />
                      </div>
                      <h3 className="font-display font-bold text-ink-900 truncate">{item.name}</h3>
                    </div>
                    {item.status && (
                      <Badge tone={tone} className="shrink-0">{item.status}</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm mt-3">
                    {item.details && <p className="text-ink-600">{item.details}</p>}
                    {item.date && <p className="text-ink-600"><span className="font-semibold text-ink-400">Date:</span> {item.date}</p>}
                    {item.doctor && <p className="text-ink-600"><span className="font-semibold text-ink-400">Doctor:</span> {item.doctor}</p>}
                  </div>
                </Card>
              ))}
            </RecordCard>
          </div>
        );
      })}
    </div>
  );
}

function toneBg(tone: 'red' | 'amber' | 'teal' | 'blue' | 'green' | 'slate'): string {
  const map = {
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-ink-100 text-ink-500',
  };
  return map[tone];
}
