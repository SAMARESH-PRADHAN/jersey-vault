import { jsPDF } from "jspdf";
import type { Order } from "@/types";

/** Generates a GST invoice PDF for a demo order (client-side only).
 *  Orders whose address carries a company + GSTIN are rendered as B2B tax invoices. */
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

  const a = order.address;
  const isB2B = !!(a.company && a.gstin);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(isB2B ? "TAX INVOICE (B2B)" : "TAX INVOICE", left, (y += 34));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice / Order ID: ${order.id}`, left, (y += 18));
  doc.text(`Date: ${new Date(order.date).toLocaleString("en-IN")}`, left, (y += 14));
  doc.text(`Payment: ${order.payment}${order.payMode === "advance" ? " · 50% Advance" : ""}`, left, (y += 14));

  doc.setFont("helvetica", "bold");
  doc.text("Ship to", left, (y += 26));
  doc.setFont("helvetica", "normal");
  [a.name, a.phone, a.house, `${a.city}, ${a.state} - ${a.pincode}`].forEach((line) => {
    doc.text(String(line), left, (y += 14));
  });

  if (isB2B) {
    doc.setFont("helvetica", "bold");
    doc.text("Buyer (Company / Club)", left, (y += 26));
    doc.setFont("helvetica", "normal");
    doc.text(String(a.company), left, (y += 14));
    doc.text(`GSTIN: ${a.gstin}`, left, (y += 14));
  }

  doc.setFont("helvetica", "bold");
  y += 26;
  doc.text("Item", left, y);
  doc.text("Qty", 380, y);
  doc.text("Amount", 470, y);
  doc.setFont("helvetica", "normal");
  doc.line(left, y + 6, 548, y + 6);

  order.items.forEach((it) => {
    y += 22;
    doc.text(doc.splitTextToSize(`${it.name} (${it.code}) · ${it.printType}${it.rosterName ? " · Roster: " + it.rosterName : ""}`, 310), left, y);
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
  if (order.payMode === "advance") {
    const paid = order.amountPaid ?? Math.round(order.total / 2);
    row("Paid Now (50% Advance)", `Rs. ${Math.round(paid)}`);
    row("Balance Due on Dispatch", `Rs. ${Math.round(order.total - paid)}`, order.balancePaid ?? false);
  } else {
    row("Amount Paid", `Rs. ${Math.round(order.amountPaid ?? order.total)}`);
  }

  doc.setFontSize(8);
  if (isB2B) doc.text("B2B tax invoice — input tax credit as per applicable GST rules.", left, 786);
  doc.text("Demo invoice generated in-browser by Jersey Fit.", left, 800);
  doc.save(`JerseyFit-Invoice-${order.id}.pdf`);
}
