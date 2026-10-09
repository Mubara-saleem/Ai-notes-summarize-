import { jsPDF } from 'jspdf';
import { SavedNote } from '../types';

export function exportNoteToPDF(note: SavedNote) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      y = 20;
      // Header on subsequent pages
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(`AI Notes Summarizer – ${note.title.slice(0, 40)}`, margin, 12);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 14, pageWidth - margin, 14);
      doc.setTextColor(30, 41, 59);
    }
  };

  // Header Banner
  doc.setFillColor(37, 99, 235); // Royal blue
  doc.rect(margin, y, contentWidth, 2, 'F');
  y += 8;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  const titleLines = doc.splitTextToSize(note.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8;

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const metaText = `Generated on ${new Date(note.createdAt).toLocaleDateString()} | Language: ${note.language.toUpperCase()} | Length: ${note.summaryLength.toUpperCase()}`;
  doc.text(metaText, margin, y);
  y += 10;

  // Short Summary
  if (note.shortSummary) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('1. Quick Summary', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const shortLines = doc.splitTextToSize(note.shortSummary, contentWidth);
    doc.text(shortLines, margin, y);
    y += shortLines.length * 5.5 + 8;
  }

  // Key Bullet Points
  if (note.bulletPoints && note.bulletPoints.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('2. Key Revision Points', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    note.bulletPoints.forEach((point) => {
      checkPageBreak(12);
      const bulletLines = doc.splitTextToSize(`•  ${point}`, contentWidth);
      doc.text(bulletLines, margin, y);
      y += bulletLines.length * 5 + 2;
    });
    y += 6;
  }

  // Detailed Summary
  if (note.detailedSummary) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('3. Detailed Study Concepts', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const paragraphs = note.detailedSummary.split('\n');
    paragraphs.forEach((p) => {
      if (!p.trim()) {
        y += 3;
        return;
      }
      checkPageBreak(15);
      const pLines = doc.splitTextToSize(p, contentWidth);
      doc.text(pLines, margin, y);
      y += pLines.length * 5 + 3;
    });
    y += 6;
  }

  // Definitions
  if (note.definitions && note.definitions.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('4. Essential Terminology & Definitions', margin, y);
    y += 6;

    note.definitions.forEach((d) => {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`▸ ${d.term}:`, margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const defLines = doc.splitTextToSize(d.definition, contentWidth - 4);
      doc.text(defLines, margin + 4, y);
      y += defLines.length * 4.5 + 4;
    });
    y += 6;
  }

  // Key Concepts
  if (note.keyConcepts && note.keyConcepts.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('5. Key Concepts & Mechanisms', margin, y);
    y += 6;

    note.keyConcepts.forEach((kc) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`★ ${kc.concept}`, margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const kcLines = doc.splitTextToSize(kc.explanation, contentWidth - 4);
      doc.text(kcLines, margin + 4, y);
      y += kcLines.length * 4.5 + 4;
    });
  }

  // Save the PDF
  const safeFilename =
    note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30) || 'study_summary';
  doc.save(`${safeFilename}_notes.pdf`);
}

export function exportNoteToTXT(note: SavedNote) {
  let content = `=====================================================\n`;
  content += `${note.title.toUpperCase()}\n`;
  content += `AI Notes Summarizer | Date: ${new Date(note.createdAt).toLocaleDateString()}\n`;
  content += `Language: ${note.language.toUpperCase()} | Length: ${note.summaryLength.toUpperCase()}\n`;
  content += `=====================================================\n\n`;

  if (note.shortSummary) {
    content += `--- 1. SHORT SUMMARY ---\n`;
    content += `${note.shortSummary}\n\n`;
  }

  if (note.bulletPoints && note.bulletPoints.length > 0) {
    content += `--- 2. KEY BULLET POINTS ---\n`;
    note.bulletPoints.forEach((p) => {
      content += `* ${p}\n`;
    });
    content += `\n`;
  }

  if (note.detailedSummary) {
    content += `--- 3. DETAILED SUMMARY ---\n`;
    content += `${note.detailedSummary}\n\n`;
  }

  if (note.definitions && note.definitions.length > 0) {
    content += `--- 4. IMPORTANT DEFINITIONS ---\n`;
    note.definitions.forEach((d) => {
      content += `[${d.term}]\n${d.definition}\n\n`;
    });
  }

  if (note.keyConcepts && note.keyConcepts.length > 0) {
    content += `--- 5. KEY CONCEPTS ---\n`;
    note.keyConcepts.forEach((kc) => {
      content += `[${kc.concept}]\n${kc.explanation}\n\n`;
    });
  }

  if (note.quiz && note.quiz.length > 0) {
    content += `--- 6. PRACTICE QUIZ ---\n`;
    note.quiz.forEach((q, idx) => {
      content += `Q${idx + 1} (${q.type.toUpperCase()}): ${q.question}\n`;
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, oIdx) => {
          content += `   [${String.fromCharCode(65 + oIdx)}] ${opt}\n`;
        });
      }
      content += `Answer: ${q.correctAnswer}\n`;
      content += `Explanation: ${q.explanation}\n\n`;
    });
  }

  if (note.flashcards && note.flashcards.length > 0) {
    content += `--- 7. FLASHCARDS ---\n`;
    note.flashcards.forEach((fc, idx) => {
      content += `Card ${idx + 1} [${fc.category || 'Concept'}]:\n`;
      content += `Front: ${fc.front}\n`;
      content += `Back: ${fc.back}\n\n`;
    });
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeFilename =
    note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30) || 'study_summary';
  link.download = `${safeFilename}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
