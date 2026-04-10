import { jsPDF } from 'jspdf';
import { formatPrice } from '../data/mockData';

export const PDFService = {
  generateAppointmentReceipt: (ticket: any, user: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136); // Teal color
    doc.text('CARE AT EASE', 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Professional Clinical Services at Home', 20, 25);
    doc.text('GSTIN: 07AAATC1234D1Z5', 20, 30);
    
    // Divider
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('TAX INVOICE / RECEIPT', 20, 50);
    
    // Details
    doc.setFontSize(12);
    doc.text(`Booking ID: ${ticket.orderNumber || ticket.id}`, 20, 65);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 20, 75);
    
    doc.text(`Patient Name: ${user?.name || 'Valued Client'}`, 20, 90);
    doc.text(`Service Type: ${ticket.serviceType}`, 20, 100);
    doc.text(`Scheduled For: ${ticket.estimatedCompletion || 'TBD'}`, 20, 110);
    doc.text(`SAC Code: 999335 (Home Healthcare Services)`, 20, 120);
    
    // Math for GST
    const baseAmount = Math.round((ticket.amount || 0) / 1.18);
    const taxAmount = (ticket.amount || 0) - baseAmount;
    
    // Tax Box
    doc.setDrawColor(220);
    doc.rect(20, 130, 170, 45);
    
    doc.setFontSize(10);
    doc.text(`Taxable Base Amount:`, 25, 140);
    doc.text(formatPrice(baseAmount), 150, 140, { align: 'right' });
    
    doc.text(`CGST (9%):`, 25, 150);
    doc.text(formatPrice(taxAmount / 2), 150, 150, { align: 'right' });
    
    doc.text(`SGST (9%):`, 25, 160);
    doc.text(formatPrice(taxAmount / 2), 150, 160, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount Paid:`, 25, 170);
    doc.text(formatPrice(ticket.amount || 0), 150, 170, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('This is an electronically generated tax invoice strictly for informational purposes.', 20, 270);
    doc.text('Support: +91 8802594790 | Email: support@careatease.com', 20, 275);
    
    return doc.output('blob');
  }
};
