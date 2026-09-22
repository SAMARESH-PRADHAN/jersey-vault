import { jsPDF } from "jspdf";
import type { Order } from "@/types";

/** Generates a GST invoice PDF for a demo order (client-side only). */
export function downloadInvoice(order: Order) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 48;
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("JERSEY FIT", left, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Plot 42, Textile Park, Tirupur, TN 641604 | GSTIN 33ABCDE1234F1Z5", left, (y += 18));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TAX INVOICE", left, (y += 34));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice / Order ID: ${order.id}`, left, (y += 18));
  doc.text(`Date: ${new Date(order.date).toLocaleString("en-IN")}`, left, (y += 14));
  doc.text(`Payment: ${order.payment}`, left, (y += 14));

  doc.setFont("helvetica", "bold");
  doc.text("Ship to", left, (y += 26));
  doc.setFont("helvetica", "normal");
  const a = order.address;
  [a.name, a.phone, a.house, `${a.city}, ${a.state} - ${a.pincode}`].forEach((line) => {
    doc.text(String(line), left, (y += 14));
  });

  doc.setFont("helvetica", "bold");
  y += 26;
  doc.text("Item", left, y);
  doc.text("Qty", 380, y);
  doc.text("Amount", 470, y);
  doc.setFont("helvetica", "normal");
  doc.line(left, y + 6, 548, y + 6);

  order.items.forEach((it) => {
    y += 22;
    doc.text(doc.splitTextToSize(`${it.name} (${it.code}) · ${it.printType}`, 310), left, y);
    doc.text(String(it.totalQty), 380, y);
    doc.text(`Rs. ${Math.round(it.lineTotal)}`, 470, y);
    y += 10;
    doc.setFontSize(8);
    doc.text(it.sizes.map((s) => `${s.size}×${s.qty}`).join("  "), left, y);
    doc.setFontSize(10);
  });

  doc.line(left, y + 12, 548, y + 12);
  y += 32;
  const row = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, 360, y);
    doc.text(value, 470, y);
    y += 16;
  };
  row("Subtotal", `Rs. ${Math.round(order.subtotal)}`);
  if (order.discount) row(`Discount ${order.coupon ?? ""}`, `- Rs. ${Math.round(order.discount)}`);
  row("GST (5%)", `Rs. ${Math.round(order.gst)}`);
  row("Grand Total", `Rs. ${Math.round(order.total)}`, true);

  doc.setFontSize(8);
  doc.text("Demo invoice generated in-browser by Jersey Fit.", left, 800);
  doc.save(`JerseyFit-Invoice-${order.id}.pdf`);
}
