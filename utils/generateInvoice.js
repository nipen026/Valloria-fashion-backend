const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (order, user, filename) => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, '../invoices', filename);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('Invoice - Vogue Vastra', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice ID: INV-${order.id}`);
  doc.text(`Customer: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Shipping Address: ${order.shippingAddress}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.text('Items:');
  order.OrderItems.forEach(item => {
    doc.text(
      `- ${item.Product.productType} (x${item.quantity}): ₹${item.price} each`
    );
  });

  doc.moveDown();
  doc.text(`Total Amount: ₹${order.totalAmount}`, { bold: true });

  doc.end();
  return filePath;
};

module.exports = generateInvoice;
