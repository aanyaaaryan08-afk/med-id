import { useState, useEffect, useMemo } from 'react';
import { Card, Badge } from '@/components/ui';
import type { ConsultationDocument, DocumentCategory } from '@/lib/documents';
import { DOCUMENT_CATEGORIES, downloadDocument, getDocumentBlobUrl } from '@/lib/documents';
import { generateConsultationPdfBlob } from '@/lib/pdf';
import { fetchItemsForConsultation } from '@/lib/consultationItems';
import type { Consultation, Patient } from '@/types';
import { FileText, Eye, Download, FileCog, AlertCircle, Stethoscope, Pill, FlaskConical, Syringe, FolderOpen, ExternalLink } from 'lucide-react';

const CATEGORY_ICONS: Record<DocumentCategory, typeof FileText> = {
  consultations: Stethoscope,
  prescriptions: Pill,
  surgeries: Stethoscope,
  tests: FlaskConical,
  vaccinations: Syringe,
  other: FolderOpen,
};

const CATEGORY_TONES: Record<DocumentCategory, 'teal' | 'blue' | 'green' | 'amber' | 'red' | 'slate'> = {
  consultations: 'teal',
  prescriptions: 'green',
  surgeries: 'blue',
  tests: 'amber',
  vaccinations: 'red',
  other: 'slate',
};

interface DocumentEntry {
  id: string;
  fileName: string;
  doctor: string;
  date: string;
  category: DocumentCategory;
  kind: 'uploaded' | 'generated';
  filePath?: string;
  consultation?: Consultation;
}

export function Documents({
  documents,
  consultations,
  patient,
}: {
  documents: ConsultationDocument[];
  consultations: Consultation[];
  patient: Patient;
}) {
  const [viewing, setViewing] = useState<DocumentEntry | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [viewError, setViewError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');
  const [pdfRendered, setPdfRendered] = useState(false);

  const entries = useMemo<DocumentEntry[]>(() => {
    const uploadedIds = new Set(documents.map((d) => d.consultationId));
    const uploaded = documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      doctor: d.doctor,
      date: d.consultationDate,
      category: d.category,
      kind: 'uploaded' as const,
      filePath: d.filePath,
    }));

    const generated = consultations
      .filter((c) => !uploadedIds.has(c.id))
      .map((c) => ({
        id: `gen-${c.id}`,
        fileName: `MED-ID_Consultation_${patient.name.replace(/[^a-zA-Z0-9]/g, '_')}_${c.date.replace(/\s/g, '_')}.pdf`,
        doctor: c.doctor,
        date: c.date,
        category: 'consultations' as DocumentCategory,
        kind: 'generated' as const,
        consultation: c,
      }));

    return [...uploaded, ...generated];
  }, [documents, consultations, patient]);

  useEffect(() => {
    if (viewing) {
      setBlobUrl(null);
      setViewError('');
      setPdfRendered(false);
      loadBlob(viewing)
        .then(setBlobUrl)
        .catch(() => setViewError('Could not load this document. Please try downloading instead.'));
    }
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewing]);

  async function loadBlob(entry: DocumentEntry): Promise<string> {
    if (entry.kind === 'uploaded' && entry.filePath) {
      return getDocumentBlobUrl(entry.filePath);
    }
    if (entry.kind === 'generated' && entry.consultation) {
      const items = await fetchItemsForConsultation(entry.consultation.id);
      const { blob } = generateConsultationPdfBlob(patient, entry.consultation, items);
      return URL.createObjectURL(blob);
    }
    throw new Error('Unknown document type');
  }

  async function handleDownloadDoc(entry: DocumentEntry): Promise<void> {
    if (entry.kind === 'uploaded' && entry.filePath) {
      await downloadDocument(entry.filePath, entry.fileName);
      return;
    }
    if (entry.kind === 'generated' && entry.consultation) {
      const items = await fetchItemsForConsultation(entry.consultation.id);
      const { blob, fileName } = generateConsultationPdfBlob(patient, entry.consultation, items);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    throw new Error('Unknown document type');
  }

  const closeViewer = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setViewing(null);
    setViewError('');
  };

  const handleDownload = async (entry: DocumentEntry) => {
    setDownloadError('');
    setDownloadingId(entry.id);
    try {
      await handleDownloadDoc(entry);
    } catch {
      setDownloadError('Could not download this document. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<DocumentCategory, DocumentEntry[]>();
    for (const entry of entries) {
      const bucket = map.get(entry.category) ?? [];
      bucket.push(entry);
      map.set(entry.category, bucket);
    }
    return map;
  }, [entries]);

  const visibleCategories = useMemo(
    () => DOCUMENT_CATEGORIES.filter((cat) => grouped.has(cat.id) && (grouped.get(cat.id)?.length ?? 0) > 0),
    [grouped],
  );

  if (entries.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">Documents</h1>
            <p className="text-sm text-ink-500">Consultation reports and medical documents</p>
          </div>
        </div>
        <Card>
          <div className="py-12 text-center">
            <FileCog size={36} className="mx-auto text-ink-300" />
            <p className="text-sm font-semibold text-ink-500 mt-3">No documents yet</p>
            <p className="text-xs text-ink-400 mt-1">
              Consultation reports generated by your doctor will appear here.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
          <FileText size={18} />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">Documents</h1>
          <p className="text-sm text-ink-500">Consultation reports and medical documents</p>
        </div>
      </div>

      {downloadError && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2 animate-fade-in-fast">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{downloadError}</p>
        </div>
      )}

      <div className="space-y-8">
        {visibleCategories.map((cat) => {
          const catEntries = grouped.get(cat.id) ?? [];
          const Icon = CATEGORY_ICONS[cat.id];
          const tone = CATEGORY_TONES[cat.id];
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-4">
                <Icon size={18} className="text-ink-500" />
                <h2 className="font-display font-bold text-ink-800">{cat.label}</h2>
                <Badge tone={tone}>{catEntries.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catEntries.map((entry) => (
                  <Card key={entry.id} hover className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="grid place-items-center h-11 w-11 rounded-xl bg-red-50 text-red-500 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-ink-900 truncate" title={entry.fileName}>
                          {entry.fileName.replace(/\.pdf$/, '')}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge tone="teal">PDF</Badge>
                          <span className="text-xs text-ink-400">
                            {entry.date || 'Date N/A'}
                          </span>
                        </div>
                        {entry.doctor && (
                          <p className="text-xs text-ink-400 mt-1">Dr. {entry.doctor}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-ink-100">
                      <button
                        onClick={() => setViewing(entry)}
                        className="btn-secondary flex-1 px-3 py-2 text-sm"
                      >
                        <Eye size={15} /> View
                      </button>
                      <button
                        onClick={() => handleDownload(entry)}
                        disabled={downloadingId === entry.id}
                        className="btn-primary flex-1 px-3 py-2 text-sm"
                      >
                        {downloadingId === entry.id ? (
                          <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download size={15} />
                        )}
                        Download
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in-fast"
          onClick={closeViewer}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-card-hover overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-ink-100">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} className="text-red-500 shrink-0" />
                <span className="text-sm font-semibold text-ink-800 truncate">{viewing.fileName}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.open(blobUrl ?? '', '_blank')}
                  disabled={!blobUrl}
                  className="btn-secondary px-3 py-1.5 text-sm"
                >
                  <ExternalLink size={14} /> Open in new tab
                </button>
                <button
                  onClick={() => handleDownload(viewing)}
                  className="btn-primary px-3 py-1.5 text-sm"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={closeViewer}
                  className="btn-secondary px-3 py-1.5 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            {viewError ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <AlertCircle size={32} className="mx-auto text-ink-300" />
                  <p className="text-sm text-ink-500 mt-3">{viewError}</p>
                </div>
              </div>
            ) : blobUrl ? (
              <div className="flex-1 w-full overflow-hidden relative bg-ink-50">
                <object
                  data={blobUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  onLoad={() => setPdfRendered(true)}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                    <FileCog size={40} className="text-ink-300" />
                    <p className="text-sm text-ink-500">
                      Your browser cannot display this PDF inline.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => window.open(blobUrl, '_blank')}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        <ExternalLink size={16} /> Open in new tab
                      </button>
                      <button
                        onClick={() => handleDownload(viewing)}
                        className="btn-secondary px-4 py-2 text-sm"
                      >
                        <Download size={16} /> Download
                      </button>
                    </div>
                  </div>
                </object>
                {!pdfRendered && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink-50/80 pointer-events-none">
                    <div className="h-8 w-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
