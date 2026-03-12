"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Subscription } from "./types";

const downloadFile = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (subscriptions: Subscription[]) => {
  const jsonString = JSON.stringify(subscriptions, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  downloadFile(blob, "subscriptions.json");
};

export const exportToCSV = (subscriptions: Subscription[]) => {
  if (subscriptions.length === 0) return;

  const headers = Object.keys(subscriptions[0]);
  const csvRows = [
    headers.join(","),
    ...subscriptions.map((sub) =>
      headers
        .map((header) => {
          const value = sub[header as keyof Subscription];
          if (value === null || value === undefined) return "";
          const str = String(value);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    ),
  ];

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  downloadFile(blob, "subscriptions.csv");
};

export const exportToPDF = async (subscriptions: Subscription[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.text("Subsight - Subscription Report", 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Total Subscriptions: ${subscriptions.length}`, 20, 36);

  // Use a temporary element for rendering the table to canvas
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px'; 
  container.style.padding = '20px';
  container.style.fontFamily = 'Helvetica, sans-serif';

  let tableHTML = `
    <style>
      table { border-collapse: collapse; width: 100%; font-size: 10px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    </style>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Cycle</th>
          <th>Start Date</th>
        </tr>
      </thead>
      <tbody>
        ${subscriptions.map(sub => `
          <tr>
            <td>${sub.name}</td>
            <td>${sub.category}</td>
            <td>${sub.amount.toFixed(2)} ${sub.currency}</td>
            <td>${sub.billingCycle}</td>
            <td>${new Date(sub.startDate).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container.querySelector('table')!);
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate aspect ratio
    const imgWidth = 170; // mm
    const pageHeight = doc.internal.pageSize.height;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 45; // Start table after header

    doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - position - 10);

    while (heightLeft >= 0) {
      position = -heightLeft - 10;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save("subscription-report.pdf");

  } catch (error) {
    console.error("Failed to generate PDF:", error);
  } finally {
    document.body.removeChild(container);
  }
};
