import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateCSV(data: any) {
  const incidents = data.incidents || [];
  const alerts = data.alerts || [];

  let csv = "INCIDENTS REPORT\n";
  csv += "ID,Title,LGA,Severity,Status,Casualties,Displaced,Date\n";
  incidents.forEach((i: any) => {
    csv += `"${i.id}","${i.title}","${i.lga}","${i.severity}","${i.status}",${i.casualties},${i.displacedPersons},"${new Date(i.createdAt).toLocaleDateString()}"\n`;
  });

  csv += "\n\nALERTS REPORT\n";
  csv += "ID,Title,Severity,Status,Date\n";
  alerts.forEach((a: any) => {
    csv += `"${a.id}","${a.title}","${a.severity}","${a.isActive ? 'Active' : 'Inactive'}","${new Date(a.createdAt).toLocaleDateString()}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `FIMS_Report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDF(data: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Branding Header
  doc.setFontSize(22);
  doc.setTextColor(20, 158, 136); // Teal-600 inspired
  doc.text("FIMS PORTAL", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Flood Incident Management System | Sokoto State", 14, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 28, { align: "right" });

  doc.setDrawColor(200);
  doc.line(14, 32, pageWidth - 14, 32);

  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Executive Summary", 14, 45);
  
  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Value']],
    body: [
      ['Total Incidents', data.summary.totalIncidents.toString()],
      ['Total Casualties', data.summary.totalCasualties.toString()],
      ['Total Persons Displaced', data.summary.totalDisplaced.toString()],
      ['Active Alerts', data.summary.totalAlerts.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' }
  });

  // Incidents Table
  doc.setFontSize(14);
  doc.text("Incident Registry Details", 14, (doc as any).lastAutoTable.finalY + 15);
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Date', 'LGA', 'Title', 'Severity', 'Status', 'Casualties']],
    body: data.incidents.map((i: any) => [
      new Date(i.createdAt).toLocaleDateString(),
      i.lga,
      i.title,
      i.severity,
      i.status.replace('_', ' '),
      i.casualties.toString()
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [20, 158, 136] }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} | FIMS Operational Report`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`FIMS_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
