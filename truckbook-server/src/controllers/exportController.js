import { exportTripsToExcel, exportTripsToPDF } from '../services/exportService.js';

// Export trips
export const exportTrips = async (req, res) => {
  try {
    const userId = req.userId;
    const { format, date, dateFrom, dateTo, truck, driver, status } = req.query;

    // Validate format
    if (!format || !['excel', 'pdf'].includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Must be "excel" or "pdf"'
      });
    }

    // Build filters (same as trips endpoint)
    const filters = {};
    if (date) filters.date = date;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (truck) filters.truck = truck;
    if (driver) filters.driver = driver;
    if (status) filters.status = status;

    const exportFormat = format.toLowerCase();

    if (exportFormat === 'excel') {
      // Generate Excel file
      const buffer = await exportTripsToExcel(userId, filters);
      
      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="trips-report-${Date.now()}.xlsx"`);
      
      res.send(buffer);
    } else if (exportFormat === 'pdf') {
      // Generate PDF file
      const buffer = await exportTripsToPDF(userId, filters);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="trips-report-${Date.now()}.pdf"`);
      
      res.send(buffer);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating export file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

