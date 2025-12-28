import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { getUserTrips, getTripStatistics } from './tripService.js';
import { getModels } from '../utils/models.js';

// Export trips to Excel (detailed version)
export const exportTripsToExcel = async (userId, filters = {}) => {
  // Get trips data
  const trips = await getUserTrips(userId, filters);
  const stats = await getTripStatistics(userId, filters);
  
  // Get user info for company name
  const { User } = await getModels();
  const user = await User.findByPk(userId);
  const companyName = user?.companyName || 'TruckBooks';

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Trips Report');

  // Set column widths
  worksheet.columns = [
    { width: 12 }, // Date
    { width: 20 }, // Truck
    { width: 15 }, // Driver
    { width: 20 }, // Customer
    { width: 25 }, // Route
    { width: 15 }, // Agreed Price
    { width: 15 }, // Total Cost
    { width: 15 }, // Profit/Loss
    { width: 12 }, // Status
    { width: 12 }, // Payment Type
    { width: 18 }, // Amount Received Before
    { width: 18 }, // Amount Received After
    { width: 15 }, // Total Received
    { width: 15 }, // Fuel Cost
    { width: 18 }, // Maintenance Cost
    { width: 15 }, // Other Costs
    { width: 30 }  // Notes
  ];

  // Header section
  worksheet.mergeCells('A1:Q1');
  worksheet.getCell('A1').value = companyName;
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:Q2');
  worksheet.getCell('A2').value = 'Trips Report';
  worksheet.getCell('A2').font = { size: 14, bold: true };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  // Date range
  if (filters.dateFrom || filters.dateTo) {
    const dateRange = `From: ${filters.dateFrom || 'All'} To: ${filters.dateTo || 'All'}`;
    worksheet.mergeCells('A3:Q3');
    worksheet.getCell('A3').value = dateRange;
    worksheet.getCell('A3').alignment = { horizontal: 'center' };
  }

  // Generated date
  worksheet.mergeCells('A4:Q4');
  worksheet.getCell('A4').value = `Generated: ${new Date().toLocaleString('en-NG')}`;
  worksheet.getCell('A4').alignment = { horizontal: 'center' };
  worksheet.getCell('A4').font = { italic: true };

  // Summary statistics
  let summaryRow = 6;
  worksheet.mergeCells(`A${summaryRow}:Q${summaryRow}`);
  worksheet.getCell(`A${summaryRow}`).value = 'Summary Statistics';
  worksheet.getCell(`A${summaryRow}`).font = { size: 12, bold: true };
  summaryRow++;

  worksheet.getCell(`A${summaryRow}`).value = 'Total Trips:';
  worksheet.getCell(`B${summaryRow}`).value = stats.totalTrips || trips.length;
  summaryRow++;

  worksheet.getCell(`A${summaryRow}`).value = 'Total Revenue:';
  worksheet.getCell(`B${summaryRow}`).value = stats.totalRevenue || 0;
  worksheet.getCell(`B${summaryRow}`).numFmt = '₦#,##0.00';
  summaryRow++;

  worksheet.getCell(`A${summaryRow}`).value = 'Total Cost:';
  worksheet.getCell(`B${summaryRow}`).value = trips.reduce((sum, trip) => sum + parseFloat(trip.totalCost || 0), 0);
  worksheet.getCell(`B${summaryRow}`).numFmt = '₦#,##0.00';
  summaryRow++;

  worksheet.getCell(`A${summaryRow}`).value = 'Total Profit/Loss:';
  worksheet.getCell(`B${summaryRow}`).value = stats.totalProfit || 0;
  worksheet.getCell(`B${summaryRow}`).numFmt = '₦#,##0.00';
  summaryRow += 2;

  // Table headers
  const headerRow = summaryRow;
  worksheet.getRow(headerRow).values = [
    'Date',
    'Truck',
    'Driver',
    'Customer',
    'Route',
    'Agreed Price',
    'Total Cost',
    'Profit/Loss',
    'Status',
    'Payment Type',
    'Amount Received (Before)',
    'Amount Received (After)',
    'Total Received',
    'Fuel Cost',
    'Maintenance Cost',
    'Other Costs',
    'Notes'
  ];

  // Style headers
  worksheet.getRow(headerRow).font = { bold: true };
  worksheet.getRow(headerRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  worksheet.getRow(headerRow).alignment = { horizontal: 'center', vertical: 'middle' };

  // Add trip data
  trips.forEach((trip, index) => {
    const row = headerRow + 1 + index;
    const profit = parseFloat(trip.totalReceived || 0) - parseFloat(trip.totalCost || 0);
    const route = `${trip.routeFrom} → ${trip.routeTo}`;

    worksheet.getRow(row).values = [
      new Date(trip.date),
      trip.truck || '',
      trip.driver || '',
      trip.customer || '',
      route,
      parseFloat(trip.agreedPrice || 0),
      parseFloat(trip.totalCost || 0),
      profit,
      trip.status || '',
      trip.paymentType || '',
      parseFloat(trip.amountReceivedBefore || 0),
      parseFloat(trip.amountReceivedAfter || 0),
      parseFloat(trip.totalReceived || 0),
      parseFloat(trip.fuelCost || 0),
      parseFloat(trip.maintenanceCost || 0),
      parseFloat(trip.otherCosts || 0),
      trip.notes || ''
    ];

    // Format currency columns
    [5, 6, 7, 10, 11, 12, 13, 14, 15].forEach(colIndex => {
      worksheet.getCell(row, colIndex + 1).numFmt = '₦#,##0.00';
    });

    // Color profit/loss column
    const profitCell = worksheet.getCell(row, 8);
    if (profit >= 0) {
      profitCell.font = { color: { argb: 'FF008000' } }; // Green
    } else {
      profitCell.font = { color: { argb: 'FFFF0000' } }; // Red
    }
  });

  // Add totals row
  const totalsRow = headerRow + 1 + trips.length;
  worksheet.getRow(totalsRow).values = [
    'TOTALS',
    '',
    '',
    '',
    '',
    trips.reduce((sum, trip) => sum + parseFloat(trip.agreedPrice || 0), 0),
    trips.reduce((sum, trip) => sum + parseFloat(trip.totalCost || 0), 0),
    trips.reduce((sum, trip) => {
      const profit = parseFloat(trip.totalReceived || 0) - parseFloat(trip.totalCost || 0);
      return sum + profit;
    }, 0),
    '',
    '',
    trips.reduce((sum, trip) => sum + parseFloat(trip.amountReceivedBefore || 0), 0),
    trips.reduce((sum, trip) => sum + parseFloat(trip.amountReceivedAfter || 0), 0),
    trips.reduce((sum, trip) => sum + parseFloat(trip.totalReceived || 0), 0),
    trips.reduce((sum, trip) => sum + parseFloat(trip.fuelCost || 0), 0),
    trips.reduce((sum, trip) => sum + parseFloat(trip.maintenanceCost || 0), 0),
    trips.reduce((sum, trip) => sum + parseFloat(trip.otherCosts || 0), 0),
    ''
  ];

  // Style totals row
  worksheet.getRow(totalsRow).font = { bold: true };
  worksheet.getRow(totalsRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0F0F0' }
  };

  // Format totals currency columns
  [5, 6, 7, 10, 11, 12, 13, 14, 15].forEach(colIndex => {
    worksheet.getCell(totalsRow, colIndex + 1).numFmt = '₦#,##0.00';
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

// Export trips to PDF (essential version)
export const exportTripsToPDF = async (userId, filters = {}) => {
  // Get trips data
  const trips = await getUserTrips(userId, filters);
  const stats = await getTripStatistics(userId, filters);
  
  // Get user info for company name
  const { User } = await getModels();
  const user = await User.findByPk(userId);
  const companyName = user?.companyName || 'TruckBooks';

  // Create PDF document
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const buffers = [];

  // Collect PDF data
  doc.on('data', (chunk) => buffers.push(chunk));
  
  // Wait for PDF to finish
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    
    doc.on('error', (error) => {
      reject(error);
    });

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(companyName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).text('Trips Report', { align: 'center' });
    doc.moveDown(0.5);

    // Date range
    if (filters.dateFrom || filters.dateTo) {
      const dateRange = `From: ${filters.dateFrom || 'All'} To: ${filters.dateTo || 'All'}`;
      doc.fontSize(10).font('Helvetica').text(dateRange, { align: 'center' });
    }

    doc.fontSize(9).text(`Generated: ${new Date().toLocaleString('en-NG')}`, { align: 'center' });
    doc.moveDown(1);

    // Summary statistics
    doc.fontSize(12).font('Helvetica-Bold').text('Summary Statistics');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Trips: ${stats.totalTrips || trips.length}`);
    doc.text(`Total Revenue: ₦${(stats.totalRevenue || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    doc.text(`Total Cost: ₦${trips.reduce((sum, trip) => sum + parseFloat(trip.totalCost || 0), 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    doc.text(`Total Profit/Loss: ₦${(stats.totalProfit || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    doc.moveDown(1);

    // Table headers
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = [60, 80, 60, 70, 90, 70, 60, 70, 50];
    const headers = ['Date', 'Truck', 'Driver', 'Customer', 'Route', 'Agreed Price', 'Total Cost', 'Profit/Loss', 'Status'];

    doc.fontSize(9).font('Helvetica-Bold');
    let x = tableLeft;
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });

    // Draw header line
    doc.moveTo(tableLeft, tableTop + 15)
       .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + 15)
       .stroke();

    // Add trip rows
    let y = tableTop + 25;
    doc.fontSize(8).font('Helvetica');

    trips.forEach((trip, index) => {
      // Check if we need a new page
      if (y > 750) {
        doc.addPage();
        y = 50;
      }

      const profit = parseFloat(trip.totalReceived || 0) - parseFloat(trip.totalCost || 0);
      const route = `${trip.routeFrom} → ${trip.routeTo}`;
      const profitText = profit >= 0 
        ? `+₦${profit.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
        : `-₦${Math.abs(profit).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

      const rowData = [
        new Date(trip.date).toLocaleDateString('en-NG'),
        trip.truck || '',
        trip.driver || '',
        trip.customer || '',
        route,
        `₦${parseFloat(trip.agreedPrice || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
        `₦${parseFloat(trip.totalCost || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
        profitText,
        trip.status || ''
      ];

      x = tableLeft;
      rowData.forEach((cell, i) => {
        if (i === 7) { // Profit/Loss column
          doc.fillColor(profit >= 0 ? 'green' : 'red');
        } else {
          doc.fillColor('black');
        }
        doc.text(cell, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += 20;
    });

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').fillColor('gray')
         .text('Generated by TruckBooks', 50, doc.page.height - 30, { align: 'center' });
    }

    doc.end();
  });
};

