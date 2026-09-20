// web/app/lib/pdf/generateCompetencyReport.ts
// Generates a professional MoSPI Competency Profile Report PDF
// Uses jspdf + jspdf-autotable (client-side only, no server needed)

import type { EmployeeCompetenciesResponse, EvaluatedCompetency } from '@/lib/api/competencies';
import type { UserProfile } from '@/lib/auth/AuthContext';

const BRAND_BLUE = [30, 58, 138] as [number, number, number];   // #1E3A8A
const BRAND_SLATE = [71, 85, 105] as [number, number, number];  // slate-600
const EMERALD = [5, 150, 105] as [number, number, number];      // emerald-600
const AMBER = [217, 119, 6] as [number, number, number];        // amber-600
const ROSE = [225, 29, 72] as [number, number, number];         // rose-600
const LIGHT_BG = [248, 250, 252] as [number, number, number];   // slate-50
const WHITE = [255, 255, 255] as [number, number, number];

function statusColor(status: string): [number, number, number] {
  switch (status) {
    case 'MEETS_REQUIREMENT':
    case 'EXCEEDS_REQUIREMENT': return EMERALD;
    case 'NEEDS_IMPROVEMENT': return AMBER;
    case 'DEVELOPING': return [37, 99, 235];
    default: return BRAND_SLATE;
  }
}

function severityColor(severity: string): [number, number, number] {
  switch (severity) {
    case 'CRITICAL': return ROSE;
    case 'HIGH': return AMBER;
    case 'MODERATE': return [202, 138, 4];
    default: return BRAND_SLATE;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'MEETS_REQUIREMENT': return 'Met';
    case 'EXCEEDS_REQUIREMENT': return 'Exceeded';
    case 'NEEDS_IMPROVEMENT': return 'Below Target';
    case 'DEVELOPING': return 'In Progress';
    case 'NOT_ASSESSED': return 'Not Assessed';
    default: return status.replace(/_/g, ' ');
  }
}

export async function generateCompetencyPDF(
  data: EmployeeCompetenciesResponse['data'],
  user: UserProfile | null,
) {
  // Dynamically import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  const generatedAt = new Date().toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // ── HEADER BANNER ────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, pageW, 42, 'F');

  // Ministry logo placeholder (left)
  doc.setFillColor(255, 255, 255, 0.2);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GOVERNMENT OF INDIA', margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ministry of Statistics & Programme Implementation', margin, 18);
  doc.text('National Statistical Systems Training Academy (NSSTA)', margin, 23);

  // Report title (right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('COMPETENCY PROFILE REPORT', pageW - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Official Cadre Transcript — MoSPI Framework', pageW - margin, 20, { align: 'right' });
  doc.text(`Generated: ${generatedAt} IST`, pageW - margin, 25.5, { align: 'right' });

  // Bottom strip of header
  doc.setFillColor(15, 40, 100);
  doc.rect(0, 35, pageW, 7, 'F');
  doc.setTextColor(180, 200, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('GYANIVO AI  ·  Competency Intelligence Platform  ·  CONFIDENTIAL — OFFICIAL USE ONLY', pageW / 2, 39.5, { align: 'center' });

  let y = 50;

  // ── EMPLOYEE INFO BLOCK ───────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentW, 36, 3, 3, 'F');
  doc.setDrawColor(220, 226, 232);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 36, 3, 3, 'S');

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Officer';
  const empCode = user?.profile?.employeeCode ?? data.employee.employeeCode ?? '—';
  const designation = user?.profile?.designation ?? data.employee.designation ?? '—';
  const jobRole = user?.profile?.jobRole?.name ?? data.employee.jobRole ?? '—';
  const dept = user?.profile?.department?.name ?? data.employee.department ?? '—';
  const qualification = user?.profile?.educationalQualification ?? '—';
  const expYears = user?.profile?.experienceYears ?? '—';
  const assignment = user?.profile?.currentAssignment ?? '—';

  const col1x = margin + 5;
  const col2x = margin + contentW / 2 + 2;

  doc.setTextColor(...BRAND_BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(fullName, col1x, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_SLATE);
  doc.text(`Employee Code: ${empCode}`, col1x, y + 15);
  doc.text(`Designation: ${designation}`, col1x, y + 21);
  doc.text(`Job Role: ${jobRole}`, col1x, y + 27);
  doc.text(`Department: ${dept}`, col1x, y + 33);

  doc.text(`Qualification: ${qualification}`, col2x, y + 15);
  doc.text(`Experience: ${expYears} years`, col2x, y + 21);
  doc.text(`Assignment: ${assignment}`, col2x, y + 27);
  doc.text(`Email: ${user?.email ?? '—'}`, col2x, y + 33);

  y += 42;

  // ── OVERALL SCORE SUMMARY ─────────────────────────────────────────────────────
  const boxW = (contentW - 6) / 4;
  const summaryItems = [
    { label: 'Overall Score', value: `${(data.overallScore ?? 0).toFixed(1)}%`, color: BRAND_BLUE },
    { label: 'Total Required', value: String(data.totalRequired ?? 0), color: BRAND_SLATE },
    { label: 'Targets Met', value: String(data.metRequirements ?? 0), color: EMERALD },
    { label: 'Active Gaps', value: String(data.belowRequirements ?? 0), color: ROSE },
  ];

  summaryItems.forEach((item, i) => {
    const bx = margin + i * (boxW + 2);
    doc.setFillColor(...WHITE);
    doc.setDrawColor(220, 226, 232);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, boxW, 18, 2, 2, 'FD');
    doc.setTextColor(...item.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(item.value, bx + boxW / 2, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_SLATE);
    doc.text(item.label.toUpperCase(), bx + boxW / 2, y + 15.5, { align: 'center' });
  });

  y += 24;

  // Overall score bar
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, 5, 2, 2, 'F');
  const fillPct = Math.min(1, (data.overallScore ?? 0) / 100);
  doc.setFillColor(...BRAND_BLUE);
  doc.roundedRect(margin, y, contentW * fillPct, 5, 2, 2, 'F');
  y += 10;

  // ── COMPETENCY TABLE ──────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_BLUE);
  doc.text('COMPETENCY-BY-COMPETENCY ASSESSMENT', margin, y);
  doc.setDrawColor(...BRAND_BLUE);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 1.5, margin + 85, y + 1.5);
  y += 6;

  const comps = data.competencies ?? [];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [[
      '#',
      'Competency Name',
      'Domain',
      'Code',
      'Current Score',
      'Required',
      'Gap',
      'Severity',
      'Status',
    ]],
    body: comps.map((c, i) => [
      i + 1,
      c.name + (c.isMandatory ? '\n[MANDATORY]' : ''),
      c.domainName,
      c.code,
      c.currentScore !== null ? `${c.currentScore}%` : 'Unassessed',
      `${c.requiredScore}%`,
      c.gap > 0 ? `-${c.gap}` : '✓',
      c.gap > 0 ? c.severity : '—',
      statusLabel(c.status),
    ]),
    headStyles: {
      fillColor: BRAND_BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 28 },
      3: { cellWidth: 18, halign: 'center', font: 'courier', fontSize: 7 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
      7: { halign: 'center', cellWidth: 16 },
      8: { halign: 'center', cellWidth: 18 },
    },
    alternateRowStyles: { fillColor: LIGHT_BG },
    didParseCell(data) {
      const col = data.column.index;
      const row = data.row.index;
      if (data.section === 'body' && row >= 0) {
        const comp = comps[row];
        if (!comp) return;
        // Gap column
        if (col === 6) {
          data.cell.styles.textColor = comp.gap > 0 ? ROSE : EMERALD;
        }
        // Severity column
        if (col === 7 && comp.gap > 0) {
          data.cell.styles.textColor = severityColor(comp.severity);
          data.cell.styles.fontStyle = 'bold';
        }
        // Status column
        if (col === 8) {
          data.cell.styles.textColor = statusColor(comp.status);
          data.cell.styles.fontStyle = 'bold';
        }
        // Score column: red if below target
        if (col === 4 && comp.currentScore !== null && comp.currentScore < comp.requiredScore) {
          data.cell.styles.textColor = ROSE;
        }
      }
    },
  });

  // @ts-ignore — jspdf-autotable adds lastAutoTable
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── GAP ANALYSIS SUMMARY ──────────────────────────────────────────────────────
  const gaps = comps.filter((c) => c.gap > 0);
  if (gaps.length > 0) {
    // New page if not enough space
    if (y > pageH - 60) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ROSE);
    doc.text('PRIORITY SKILL GAPS REQUIRING INTERVENTION', margin, y);
    doc.setDrawColor(...ROSE);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 1.5, margin + 82, y + 1.5);
    y += 7;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Priority', 'Competency', 'Domain', 'Current Score', 'Required', 'Point Gap', 'Severity', 'Rationale']],
      body: gaps
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .map((c, i) => [
          i + 1,
          c.name,
          c.domainName,
          c.currentScore !== null ? `${c.currentScore}%` : 'Unassessed',
          `${c.requiredScore}%`,
          `-${c.gap} pts`,
          c.severity,
          c.reason.length > 80 ? c.reason.slice(0, 80) + '…' : c.reason,
        ]),
      headStyles: {
        fillColor: [127, 29, 29],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 3,
      },
      bodyStyles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 38, fontStyle: 'bold' },
        2: { cellWidth: 25 },
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 16, textColor: ROSE, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
        7: { cellWidth: 39 },
      },
      alternateRowStyles: { fillColor: [255, 245, 245] },
    });

    // @ts-ignore
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── FOOTER ON ALL PAGES ───────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(241, 245, 249);
    doc.rect(0, pageH - 12, pageW, 12, 'F');
    doc.setTextColor(...BRAND_SLATE);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
      `MoSPI — Gyanivo AI Competency Intelligence Platform  |  ${fullName}  |  ${empCode}  |  Confidential`,
      margin,
      pageH - 5,
    );
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
  }

  // ── SAVE ──────────────────────────────────────────────────────────────────────
  const safeName = fullName.replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`MoSPI_Competency_Report_${safeName}_${dateStr}.pdf`);
}
