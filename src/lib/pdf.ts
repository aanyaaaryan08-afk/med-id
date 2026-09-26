import { jsPDF } from 'jspdf';
import type { Patient, Consultation, ConsultationItem, ItemCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';

const CATEGORY_ORDER: ItemCategory[] = [
  'diagnosis',
  'condition',
  'allergy',
  'medication',
  'imaging',
  'lab_test',
  'procedure',
  'vaccination',
  'recommendation',
  'follow_up',
  'other',
];

interface PdfConfig {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
}

export function generateConsultationPdf(
  patient: Patient,
  consultation: Consultation,
  items: ConsultationItem[]
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const cfg: PdfConfig = {
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    margin: 48,
    contentWidth: 0,
  };
  cfg.contentWidth = cfg.pageWidth - cfg.margin * 2;

  let y = 0;

  // Header band
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, cfg.pageWidth, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('MED-ID', cfg.margin, 32);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Consultation Report', cfg.margin, 50);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, cfg.pageWidth - cfg.margin, 32, { align: 'right' });

  y = 100;

  // Patient information
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Patient Information', cfg.margin, y);
  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(cfg.margin, y, cfg.pageWidth - cfg.margin, y);
  y += 18;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const patientRows: [string, string][] = [
    ['Name', patient.name],
    ['Age', patient.age > 0 ? `${patient.age} years` : 'N/A'],
    ['Gender', patient.gender || 'N/A'],
    ['MED-ID', patient.medId],
  ];
  for (const [label, value] of patientRows) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(label, cfg.margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(value, cfg.margin + 90, y);
    y += 16;
  }

  y += 12;

  // Consultation details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text('Consultation Details', cfg.margin, y);
  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(cfg.margin, y, cfg.pageWidth - cfg.margin, y);
  y += 18;

  doc.setFontSize(10);
  const consultationRows: [string, string][] = [
    ['Date', consultation.date],
    ['Doctor', consultation.doctor],
    ['Specialization', consultation.specialization],
    ['Reason for Visit', consultation.reason],
    ['Diagnosis', consultation.diagnosis],
    ['Prescription', consultation.prescription],
    ['Tests', consultation.tests],
    ['Notes', consultation.notes],
    ['Follow-up', consultation.followUp],
  ];

  for (const [label, value] of consultationRows) {
    const wrapped = doc.splitTextToSize(value, cfg.contentWidth - 90);
    const rowHeight = Math.max(16, wrapped.length * 13);
    if (y + rowHeight > cfg.pageHeight - cfg.margin - 30) {
      addFooter(doc, cfg);
      doc.addPage();
      y = cfg.margin;
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(label, cfg.margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(wrapped, cfg.margin + 90, y);
    y += rowHeight;
  }

  y += 16;

  // Medical items by category
  if (items.length > 0) {
    if (y + 30 > cfg.pageHeight - cfg.margin - 30) {
      addFooter(doc, cfg);
      doc.addPage();
      y = cfg.margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('Medical Records from This Consultation', cfg.margin, y);
    y += 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(cfg.margin, y, cfg.pageWidth - cfg.margin, y);
    y += 18;

    const byCategory = new Map<ItemCategory, ConsultationItem[]>();
    for (const cat of CATEGORY_ORDER) {
      byCategory.set(cat, []);
    }
    for (const item of items) {
      const bucket = byCategory.get(item.category) ?? byCategory.get('other')!;
      bucket.push(item);
    }

    for (const cat of CATEGORY_ORDER) {
      const catItems = byCategory.get(cat);
      if (!catItems || catItems.length === 0) continue;

      if (y + 40 > cfg.pageHeight - cfg.margin - 30) {
        addFooter(doc, cfg);
        doc.addPage();
        y = cfg.margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text(CATEGORY_LABELS[cat], cfg.margin, y);
      y += 16;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);

      for (const item of catItems) {
        const nameLines = doc.splitTextToSize(item.name, cfg.contentWidth - 20);
        const detailLines = item.details ? doc.splitTextToSize(item.details, cfg.contentWidth - 20) : [];
        const statusText = item.status ? ` [${item.status}]` : '';
        const dateText = item.date ? ` — ${item.date}` : '';
        const totalLines = nameLines.length + detailLines.length;
        const rowHeight = Math.max(14, totalLines * 13) + 4;

        if (y + rowHeight > cfg.pageHeight - cfg.margin - 30) {
          addFooter(doc, cfg);
          doc.addPage();
          y = cfg.margin;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(nameLines, cfg.margin + 8, y);
        if (statusText) {
          const nameWidth = doc.getTextWidth(nameLines[0]);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(statusText, cfg.margin + 8 + nameWidth + 4, y);
          doc.setTextColor(30, 41, 59);
        }
        y += nameLines.length * 13;

        if (item.details) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(detailLines, cfg.margin + 16, y);
          y += detailLines.length * 13;
        }

        if (dateText || item.doctor) {
          const metaParts: string[] = [];
          if (dateText) metaParts.push(item.date);
          if (item.doctor) metaParts.push(item.doctor);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(metaParts.join(' · '), cfg.margin + 16, y);
          doc.setFontSize(10);
          y += 12;
        }

        y += 6;
      }
      y += 8;
    }
  }

  addFooter(doc, cfg);
  const safeName = patient.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`MED-ID_Consultation_${safeName}_${consultation.date.replace(/\s/g, '_')}.pdf`);
}

function addFooter(doc: jsPDF, cfg: PdfConfig): void {
  const pageCount = doc.getNumberOfPages();
  const page = doc.getCurrentPageInfo().pageNumber;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'MED-ID Digital Medical Record — Science Exhibition Prototype',
    cfg.margin,
    cfg.pageHeight - 24
  );
  doc.text(`Page ${page} of ${pageCount}`, cfg.pageWidth - cfg.margin, cfg.pageHeight - 24, {
    align: 'right',
  });
}
