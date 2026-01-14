/**
 * Receipt PDF Generator
 *
 * Generates professional payment receipts with logo and payment table
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a payment receipt PDF
 *
 * @param {Object} data - Receipt data
 * @param {string} data.receiptNumber - Unique receipt number
 * @param {Object} data.student - Student info {name, email}
 * @param {Object} data.course - Course info {title}
 * @param {Object} data.payment - Payment details {amount, method, date, notes}
 * @param {Object} data.billing - Billing summary {totalAmount, paidBefore, paidNow, remainingBalance}
 * @param {Object} data.issuedBy - Reception staff {name}
 * @param {string} outputPath - Path to save PDF file
 * @returns {Promise<string>} Path to generated PDF
 */
const generateReceipt = async (data, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Pipe to file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Colors
      const primaryColor = '#003300';
      const accentColor = '#006600';
      const lightGray = '#f5f5f5';

      let y = 50; // Current Y position

      // ========== HEADER WITH LOGO ==========
      const logoPath = path.join(__dirname, '../../public/logo.png');

      // Check if logo exists
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 50, y, { width: 80, height: 80 });
        } catch (err) {
          console.warn('Could not load logo:', err.message);
        }
      }

      // Company info (right side of logo)
      doc.fontSize(24)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('ROBOTRICK', 150, y, { align: 'left' });

      doc.fontSize(10)
         .fillColor(accentColor)
         .font('Helvetica')
         .text('Aleppo, Syria', 150, y + 30);

      doc.text('Phone: +963-942-060-440', 150, y + 45);

      y += 100;

      // ========== TITLE ==========
      doc.fontSize(20)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('PAYMENT RECEIPT', 50, y, { align: 'center' });

      y += 40;

      // ========== RECEIPT INFO ==========
      doc.fontSize(10)
         .fillColor('#666')
         .font('Helvetica');

      // Receipt number and date in two columns
      const receiptInfoY = y;
      doc.text(`Receipt #: ${data.receiptNumber}`, 50, receiptInfoY);

      const dateStr = new Date(data.payment.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = new Date(data.payment.date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.text(`Date: ${dateStr}`, 350, receiptInfoY, { align: 'right' });
      doc.text(`Time: ${timeStr}`, 350, receiptInfoY + 15, { align: 'right' });

      y += 50;

      // ========== DIVIDER LINE ==========
      doc.strokeColor(primaryColor)
         .lineWidth(2)
         .moveTo(50, y)
         .lineTo(545, y)
         .stroke();

      y += 30;

      // ========== STUDENT INFORMATION ==========
      doc.fontSize(12)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('STUDENT INFORMATION', 50, y);

      y += 20;

      doc.fontSize(10)
         .fillColor('#333')
         .font('Helvetica');

      doc.text(`Name: ${data.student.name}`, 50, y);
      y += 15;
      doc.text(`Email: ${data.student.email}`, 50, y);
      y += 15;
      doc.text(`Course: ${data.course.title}`, 50, y);

      y += 35;

      // ========== PAYMENT DETAILS TABLE ==========
      doc.fontSize(12)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('PAYMENT DETAILS', 50, y);

      y += 25;

      // Table configuration
      const tableTop = y;
      const tableLeft = 50;
      const tableWidth = 495;
      const col1Width = 350;
      const col2Width = 145;
      const rowHeight = 30;

      const drawTableRow = (desc, amount, rowY, isBold = false, bgColor = null) => {
        // Background
        if (bgColor) {
          doc.rect(tableLeft, rowY, tableWidth, rowHeight)
             .fill(bgColor);
        }

        // Text
        const font = isBold ? 'Helvetica-Bold' : 'Helvetica';
        doc.font(font)
           .fontSize(10)
           .fillColor('#333');

        doc.text(desc, tableLeft + 15, rowY + 10, { width: col1Width - 30 });
        doc.text(amount, tableLeft + col1Width + 15, rowY + 10, {
          width: col2Width - 30,
          align: 'right'
        });

        // Border
        doc.strokeColor('#ddd')
           .lineWidth(1)
           .rect(tableLeft, rowY, tableWidth, rowHeight)
           .stroke();
      };

      // Table header
      doc.rect(tableLeft, tableTop, tableWidth, rowHeight)
         .fill(primaryColor);

      doc.fontSize(11)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('Description', tableLeft + 15, tableTop + 10);

      doc.text('Amount', tableLeft + col1Width + 15, tableTop + 10, {
        width: col2Width - 30,
        align: 'right'
      });

      y = tableTop + rowHeight;

      // Table rows
      drawTableRow('Course Total Fee', `$${data.billing.totalAmount.toFixed(2)}`, y, false, lightGray);
      y += rowHeight;

      drawTableRow('Previously Paid', `$${data.billing.paidBefore.toFixed(2)}`, y);
      y += rowHeight;

      const paymentMethodLabel = data.payment.method.replace('_', ' ').toUpperCase();
      drawTableRow(
        `This Payment (${paymentMethodLabel})`,
        `$${data.billing.paidNow.toFixed(2)}`,
        y,
        false,
        lightGray
      );
      y += rowHeight;

      // Remaining balance row (highlighted)
      doc.rect(tableLeft, y, tableWidth, rowHeight)
         .fill('#e8f5e9');

      doc.fontSize(11)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('REMAINING BALANCE', tableLeft + 15, y + 10);

      doc.text(`$${data.billing.remainingBalance.toFixed(2)}`, tableLeft + col1Width + 15, y + 10, {
        width: col2Width - 30,
        align: 'right'
      });

      doc.strokeColor(primaryColor)
         .lineWidth(2)
         .rect(tableLeft, y, tableWidth, rowHeight)
         .stroke();

      y += rowHeight + 25;

      // ========== NOTES (if any) ==========
      if (data.payment.notes && data.payment.notes.trim()) {
        doc.fontSize(10)
           .fillColor('#666')
           .font('Helvetica')
           .text(`Notes: ${data.payment.notes}`, 50, y, { width: 495 });

        y += 30;
      }

      // ========== ISSUED BY ==========
      y += 20;
      doc.fontSize(10)
         .fillColor('#666')
         .font('Helvetica')
         .text(`Received by: ${data.issuedBy.name} (Reception)`, 50, y);

      y += 40;

      // ========== SIGNATURE LINE ==========
      doc.strokeColor('#999')
         .lineWidth(1)
         .moveTo(50, y)
         .lineTo(250, y)
         .stroke();

      doc.fontSize(9)
         .fillColor('#999')
         .text('Authorized Signature', 50, y + 5);

      // ========== FOOTER ==========
      y += 60;
      doc.fontSize(10)
         .fillColor(accentColor)
         .font('Helvetica-Bold')
         .text('Thank you for your payment!', 50, y, { align: 'center', width: 495 });

      doc.fontSize(8)
         .fillColor('#999')
         .font('Helvetica')
         .text('This is a computer-generated receipt and does not require a signature.', 50, y + 20, {
           align: 'center',
           width: 495
         });

      // Finalize PDF
      doc.end();

      // Wait for file to be written
      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateReceipt
};
