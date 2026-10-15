import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AHNI_LOGO_BASE64 } from './ahniLogoBase64';

interface WorkforceAnalysisData {
  id: string;
  position: string | { name: string };
  location: string | { name: string };
  current_staff_count: number;
  wisn_required_staff_count: number;
  shortage_excess_count: number;
  workforce_problem: string;
  wisn_ratio: string;
  workload_problem: string;
}

/**
 * Export Workforce Need Analysis data to Excel
 */
export const exportToExcel = (
  data: WorkforceAnalysisData[],
  filters?: {
    position?: string;
    location?: string;
  }
) => {
  // Transform data for Excel
  const excelData = data.map((item) => ({
    'Position': typeof item.position === 'object' ? item.position.name : item.position,
    'Location': typeof item.location === 'object' ? item.location.name : item.location,
    'Current Staff': item.current_staff_count,
    'Required Staff (WISN)': item.wisn_required_staff_count,
    'Shortage/Excess': item.shortage_excess_count,
    'Workforce Status': item.workforce_problem,
    'WISN Ratio': item.wisn_ratio,
    'Workload Pressure': item.workload_problem,
  }));

  // Calculate summary
  const totalShortage = data.reduce((sum, item) =>
    item.shortage_excess_count < 0 ? sum + Math.abs(item.shortage_excess_count) : sum, 0
  );
  const totalSurplus = data.reduce((sum, item) =>
    item.shortage_excess_count > 0 ? sum + item.shortage_excess_count : sum, 0
  );
  const optimalCount = data.filter(item => item.shortage_excess_count === 0).length;

  // Add summary rows
  excelData.push(
    {}, // Empty row
    { 'Position': 'SUMMARY', 'Location': '', 'Current Staff': '', 'Required Staff (WISN)': '',
      'Shortage/Excess': '', 'Workforce Status': '', 'WISN Ratio': '', 'Workload Pressure': '' },
    { 'Position': 'Total Positions Analyzed', 'Location': data.length, 'Current Staff': '', 'Required Staff (WISN)': '',
      'Shortage/Excess': '', 'Workforce Status': '', 'WISN Ratio': '', 'Workload Pressure': '' },
    { 'Position': 'Total Shortage', 'Location': totalShortage, 'Current Staff': '', 'Required Staff (WISN)': '',
      'Shortage/Excess': '', 'Workforce Status': '', 'WISN Ratio': '', 'Workload Pressure': '' },
    { 'Position': 'Total Surplus', 'Location': totalSurplus, 'Current Staff': '', 'Required Staff (WISN)': '',
      'Shortage/Excess': '', 'Workforce Status': '', 'WISN Ratio': '', 'Workload Pressure': '' },
    { 'Position': 'Optimal Staffing', 'Location': optimalCount, 'Current Staff': '', 'Required Staff (WISN)': '',
      'Shortage/Excess': '', 'Workforce Status': '', 'WISN Ratio': '', 'Workload Pressure': '' },
  );

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Position
    { wch: 30 }, // Location
    { wch: 15 }, // Current Staff
    { wch: 20 }, // Required Staff
    { wch: 15 }, // Shortage/Excess
    { wch: 18 }, // Workforce Status
    { wch: 12 }, // WISN Ratio
    { wch: 18 }, // Workload Pressure
  ];

  // Add metadata sheet
  const metaData = [
    { 'Field': 'Report Title', 'Value': 'Workforce Need Analysis Report' },
    { 'Field': 'Generated Date', 'Value': new Date().toLocaleString() },
    { 'Field': 'Organization', 'Value': 'AHNI' },
    { 'Field': 'Total Records', 'Value': data.length },
  ];

  if (filters?.position) {
    metaData.push({ 'Field': 'Filtered by Position', 'Value': filters.position });
  }
  if (filters?.location) {
    metaData.push({ 'Field': 'Filtered by Location', 'Value': filters.location });
  }

  const metaWs = XLSX.utils.json_to_sheet(metaData);
  metaWs['!cols'] = [{ wch: 20 }, { wch: 40 }];

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Workforce Analysis');
  XLSX.utils.book_append_sheet(wb, metaWs, 'Report Info');

  // Generate filename
  const date = new Date().toISOString().split('T')[0];
  const filename = `Workforce_Need_Analysis_${date}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);

  return filename;
};

/**
 * Export Workforce Need Analysis data to PDF
 */
export const exportToPDF = (
  data: WorkforceAnalysisData[],
  filters?: {
    position?: string;
    location?: string;
  }
) => {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.width;

  // ============ AHNI BRANDED HEADER ============

  // Add top border
  doc.setFillColor(41, 128, 185); // Primary blue color
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Add logo (centered at top)
  try {
    doc.addImage(AHNI_LOGO_BASE64, 'PNG', (pageWidth / 2) - 15, 8, 30, 30);
  } catch (error) {
    console.warn('Logo could not be added to PDF:', error);
  }

  // Organization Name (centered, below logo)
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('Achieving Health Nigeria Initiative (AHNI)', pageWidth / 2, 45, { align: 'center' });

  // Address (centered)
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('No. 30 Anthony Enahoro Street, Utako District, Abuja, Nigeria', pageWidth / 2, 50, { align: 'center' });

  // Contact Information (centered)
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Tel: +234-09-4615555 / +234-09-461500  |  Fax: +234-09-4615511  |  Email: info@ahnigeria.org.ng',
    pageWidth / 2, 55, { align: 'center' });

  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 58, pageWidth - 14, 58);

  // Report Title
  doc.setFillColor(41, 128, 185);
  doc.rect((pageWidth / 2) - 55, 62, 110, 12, 'F');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKFORCE NEED ANALYSIS REPORT', pageWidth / 2, 70, { align: 'center' });

  // Metadata section
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  const generatedDate = new Date().toLocaleString();
  doc.text(`Generated: ${generatedDate}`, 14, 80);

  let currentY = 80;

  if (filters?.position || filters?.location) {
    let filterText = 'Filters Applied: ';
    const filterParts = [];
    if (filters.position) filterParts.push(`Position: ${filters.position}`);
    if (filters.location) filterParts.push(`Location: ${filters.location}`);
    filterText += filterParts.join(' | ');
    doc.text(filterText, 14, 85);
    currentY = 85;
  }

  // Calculate summary statistics
  const totalShortage = data.reduce((sum, item) =>
    item.shortage_excess_count < 0 ? sum + Math.abs(item.shortage_excess_count) : sum, 0
  );
  const totalSurplus = data.reduce((sum, item) =>
    item.shortage_excess_count > 0 ? sum + item.shortage_excess_count : sum, 0
  );
  const optimalCount = data.filter(item => item.shortage_excess_count === 0).length;
  const shortageCount = data.filter(item => item.shortage_excess_count < 0).length;
  const surplusCount = data.filter(item => item.shortage_excess_count > 0).length;

  // Add summary boxes (adjust startY based on header)
  const startY = currentY + 8;

  // Summary statistics
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.setFillColor(240, 240, 240);
  doc.rect(14, startY, 60, 25, 'F');
  doc.text('Summary Statistics', 16, startY + 6);
  doc.setFontSize(9);
  doc.text(`Total Positions: ${data.length}`, 16, startY + 12);
  doc.text(`Shortage Positions: ${shortageCount}`, 16, startY + 17);
  doc.text(`Surplus Positions: ${surplusCount}`, 16, startY + 22);

  doc.setFillColor(255, 240, 240);
  doc.rect(78, startY, 60, 25, 'F');
  doc.setFontSize(11);
  doc.setTextColor(200, 0, 0);
  doc.text('Total Shortage', 80, startY + 6);
  doc.setFontSize(16);
  doc.text(`${totalShortage}`, 80, startY + 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Staff needed', 80, startY + 22);

  doc.setFillColor(240, 255, 240);
  doc.rect(142, startY, 60, 25, 'F');
  doc.setFontSize(11);
  doc.setTextColor(0, 150, 0);
  doc.text('Total Surplus', 144, startY + 6);
  doc.setFontSize(16);
  doc.text(`${totalSurplus}`, 144, startY + 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Staff available', 144, startY + 22);

  doc.setFillColor(240, 248, 255);
  doc.rect(206, startY, 60, 25, 'F');
  doc.setFontSize(11);
  doc.setTextColor(0, 100, 200);
  doc.text('Optimal', 208, startY + 6);
  doc.setFontSize(16);
  doc.text(`${optimalCount}`, 208, startY + 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Balanced positions', 208, startY + 22);

  // Prepare table data
  const tableData = data.map((item) => [
    typeof item.position === 'object' ? item.position.name : item.position,
    typeof item.location === 'object' ? item.location.name : item.location,
    item.current_staff_count.toString(),
    item.wisn_required_staff_count.toString(),
    item.shortage_excess_count.toString(),
    item.workforce_problem,
    item.wisn_ratio,
    item.workload_problem,
  ]);

  // Add table
  autoTable(doc, {
    startY: startY + 30,
    head: [['Position', 'Location', 'Current\nStaff', 'Required\n(WISN)', 'Shortage/\nExcess', 'Workforce\nStatus', 'WISN\nRatio', 'Workload\nPressure']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 25, halign: 'center' },
    },
    didParseCell: (data) => {
      // Color code shortage/excess column
      if (data.column.index === 4 && data.section === 'body') {
        const value = parseInt(data.cell.text[0]);
        if (value < 0) {
          data.cell.styles.textColor = [200, 0, 0]; // Red for shortage
          data.cell.styles.fontStyle = 'bold';
        } else if (value > 0) {
          data.cell.styles.textColor = [0, 100, 200]; // Blue for surplus
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [0, 150, 0]; // Green for balance
        }
      }
      // Color code workforce status
      if (data.column.index === 5 && data.section === 'body') {
        const status = data.cell.text[0];
        if (status === 'SHORTAGE') {
          data.cell.styles.fillColor = [255, 240, 240];
          data.cell.styles.textColor = [200, 0, 0];
        } else if (status === 'SURPLUS') {
          data.cell.styles.fillColor = [240, 248, 255];
          data.cell.styles.textColor = [0, 100, 200];
        } else {
          data.cell.styles.fillColor = [240, 255, 240];
          data.cell.styles.textColor = [0, 150, 0];
        }
      }
      // Color code workload pressure
      if (data.column.index === 7 && data.section === 'body') {
        const pressure = data.cell.text[0];
        if (pressure === 'HIGH') {
          data.cell.styles.fillColor = [255, 240, 240];
          data.cell.styles.textColor = [200, 0, 0];
        } else if (pressure === 'NONE') {
          data.cell.styles.fillColor = [245, 245, 245];
          data.cell.styles.textColor = [100, 100, 100];
        } else {
          data.cell.styles.fillColor = [240, 255, 240];
          data.cell.styles.textColor = [0, 150, 0];
        }
      }
    },
    margin: { top: 10, left: 14, right: 14 },
  });

  // Add branded footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, doc.internal.pageSize.height - 15, pageWidth - 14, doc.internal.pageSize.height - 15);

    // Footer text
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');

    // Left: System name
    doc.text(
      'AHNI Workforce Analytics System | Confidential',
      14,
      doc.internal.pageSize.height - 8
    );

    // Center: Page number
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 8,
      { align: 'center' }
    );

    // Right: Date
    doc.text(
      new Date().toLocaleDateString(),
      pageWidth - 14,
      doc.internal.pageSize.height - 8,
      { align: 'right' }
    );

    // Bottom color bar
    doc.setFillColor(41, 128, 185);
    doc.rect(0, doc.internal.pageSize.height - 3, pageWidth, 3, 'F');
  }

  // Generate filename and save
  const date = new Date().toISOString().split('T')[0];
  const filename = `Workforce_Need_Analysis_${date}.pdf`;
  doc.save(filename);

  return filename;
};
