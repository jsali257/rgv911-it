import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import fetch from "node-fetch";
import { 
  fetchTicketDepartmentByMonthReport,
  fetchProjectsByDateRange,
  fetchAssignmentsByDateRange,
  fetchDepartmentsByDateRange
} from "@/app/lib/data";
import moment from "moment-timezone";

async function fetchLogoAsBase64(url) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Error fetching logo:", error);
    throw new Error("Failed to fetch logo.");
  }
}

async function generateTicketsReport(fromDate, toDate) {
  const ticketData = await fetchTicketDepartmentByMonthReport(fromDate, toDate);
  const departments = Object.keys(ticketData[0]).filter(key => key !== 'month');
  
  const tableHeaders = ["Month", ...departments, "Total"];
  const tableBody = ticketData.map(monthData => {
    const row = [monthData.month];
    let monthlyTotal = 0;

    departments.forEach(department => {
      const count = monthData[department];
      row.push(count);
      monthlyTotal += count;
    });

    row.push(monthlyTotal);
    return row;
  });

  // Add total row
  const totalRow = ["Total"];
  departments.forEach(department => {
    const departmentTotal = ticketData.reduce((sum, monthData) => sum + monthData[department], 0);
    totalRow.push(departmentTotal);
  });
  const grandTotal = totalRow.slice(1).reduce((sum, count) => sum + count, 0);
  totalRow.push(grandTotal);
  tableBody.push(totalRow);

  return { headers: tableHeaders, body: tableBody };
}

async function generateProjectsReport(fromDate, toDate) {
  const projectData = await fetchProjectsByDateRange(fromDate, toDate);
  
  const tableHeaders = ["Month", "Not Started", "In Progress", "Completed", "On Hold", "Cancelled", "Total"];
  const tableBody = projectData.map(monthData => {
    const total = (monthData.notStarted || 0) + (monthData.inProgress || 0) + (monthData.completed || 0) + (monthData.onHold || 0) + (monthData.cancelled || 0);
    return [
      monthData.month,
      monthData.notStarted || 0,
      monthData.inProgress || 0,
      monthData.completed || 0,
      monthData.onHold || 0,
      monthData.cancelled || 0,
      total
    ];
  });

  // Add total row
  const totalRow = ["Total"];
  const totals = {
    notStarted: projectData.reduce((sum, data) => sum + (data.notStarted || 0), 0),
    inProgress: projectData.reduce((sum, data) => sum + (data.inProgress || 0), 0),
    completed: projectData.reduce((sum, data) => sum + (data.completed || 0), 0),
    onHold: projectData.reduce((sum, data) => sum + (data.onHold || 0), 0),
    cancelled: projectData.reduce((sum, data) => sum + (data.cancelled || 0), 0)
  };
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  totalRow.push(
    totals.notStarted,
    totals.inProgress,
    totals.completed,
    totals.onHold,
    totals.cancelled,
    grandTotal
  );
  tableBody.push(totalRow);

  return { headers: tableHeaders, body: tableBody };
}

async function generateDepartmentReport(fromDate, toDate) {
  const departmentData = await fetchDepartmentsByDateRange(fromDate, toDate);
  
  const tableHeaders = ["Department", "Open", "In Progress", "Closed", "Total"];
  const tableBody = departmentData.map(dept => {
    const total = dept.open + dept.inProgress + dept.closed;
    return [dept._id, dept.open, dept.inProgress, dept.closed, total];
  });

  // Add total row
  const totalRow = ["Total"];
  const columns = [1, 2, 3]; // Column indices for status counts
  columns.forEach(col => {
    const sum = tableBody.reduce((total, row) => total + row[col], 0);
    totalRow.push(sum);
  });
  const grandTotal = totalRow.slice(1).reduce((sum, count) => sum + count, 0);
  totalRow.push(grandTotal);
  tableBody.push(totalRow);

  return { headers: tableHeaders, body: tableBody };
}

async function generateAssignmentsReport(fromDate, toDate) {
  const assignmentData = await fetchAssignmentsByDateRange(fromDate, toDate);
  
  const tableHeaders = ["Assignee", "Open", "In Progress", "On Hold", "Closed", "Total"];
  const tableBody = Object.entries(assignmentData).map(([assignee, data]) => {
    const total = data.open + data.inProgress + data.onHold + data.closed;
    return [
      assignee,
      data.open,
      data.inProgress,
      data.onHold,
      data.closed,
      total
    ];
  });

  // Add total row
  const totalRow = ["Total"];
  const columns = [1, 2, 3, 4]; // Column indices for status counts
  columns.forEach(col => {
    const sum = tableBody.reduce((total, row) => total + row[col], 0);
    totalRow.push(sum);
  });
  const grandTotal = totalRow.slice(1).reduce((sum, count) => sum + count, 0);
  totalRow.push(grandTotal);
  tableBody.push(totalRow);

  return { headers: tableHeaders, body: tableBody };
}

export async function POST(req) {
  try {
    const { fromDate, toDate, reportType } = await req.json();

    // Convert dates to local time
    const localFromDate = moment(fromDate).tz("America/Chicago").startOf("day").toDate();
    const localToDate = moment(toDate).tz("America/Chicago").endOf("day").toDate();

    // Logo URL
    const logoUrl = "https://res.cloudinary.com/dql3efszd/image/upload/v1736874273/RGV911-Logo_pqibpo.png";
    const logoBase64 = await fetchLogoAsBase64(logoUrl);

    // Initialize PDF
    const doc = new jsPDF();
    doc.addImage(logoBase64, "PNG", 14, 10, 20, 20);

    // Add header
    const fromYear = moment(localFromDate).format("YYYY");
    const toYear = moment(localToDate).format("YYYY");
    doc.setFontSize(16);
    doc.text("RGV911 District", 40, 15);
    doc.setFontSize(8);
    doc.text("Business Operations", 40, 20);
    doc.setFontSize(10);

    // Set report title and get data based on type
    let reportTitle;
    let tableData;

    switch (reportType) {
      case "tickets":
        reportTitle = "Technical and IT Support Requests Report";
        tableData = await generateTicketsReport(localFromDate, localToDate);
        break;
      case "projects":
        reportTitle = "Projects Status Report";
        tableData = await generateProjectsReport(localFromDate, localToDate);
        break;
      case "departments":
        reportTitle = "Department Performance Report";
        tableData = await generateDepartmentReport(localFromDate, localToDate);
        break;
      case "assignments":
        reportTitle = "Staff Assignments Report";
        tableData = await generateAssignmentsReport(localFromDate, localToDate);
        break;
      default:
        throw new Error("Invalid report type");
    }

    doc.text(reportTitle, 40, 25);
    doc.setFontSize(12);
    doc.text(`${fromYear} - ${toYear}`, 40, 30);

    // Generate table
    autoTable(doc, {
      startY: 45,
      head: [tableData.headers],
      body: tableData.body,
      styles: {
        fontSize: 10,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [22, 26, 36],
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        [tableData.headers.length - 1]: {
          fontStyle: "bold",
          fillColor: [255, 223, 186],
        },
      },
      rowStyles: {
        [tableData.body.length - 1]: {
          fillColor: [242, 85, 96],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
      },
    });

    // Return PDF
    const pdfBlob = doc.output("blob");
    return new Response(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${reportType}_report.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return new Response("Failed to generate report.", { status: 500 });
  }
}
