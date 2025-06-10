"use client";

import { useState } from "react";
import Image from "next/image";

interface EventReport {
  id: number;
  title: string;
  content: string;
  reportType: string;
  totalParticipants: number | null;
  status: string;
  createdAt: Date;
  event: {
    id: number;
    title: string;
  };
}

interface EventReportDownloadProps {
  report: EventReport;
}

const EventReportDownload = ({ report }: EventReportDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReportContent = () => {
    const reportData = {
      title: report.title,
      reportId: report.id,
      event: report.event.title,
      reportType: report.reportType.replace('_', ' '),
      status: report.status,
      totalParticipants: report.totalParticipants,
      createdAt: new Intl.DateTimeFormat("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(report.createdAt),
      content: report.content
    };

    return `
EVENT REPORT
============

Report Title: ${reportData.title}
Report ID: ${reportData.reportId}
Event: ${reportData.event}
Report Type: ${reportData.reportType}
Status: ${reportData.status}
${reportData.totalParticipants ? `Total Participants: ${reportData.totalParticipants}` : ''}
Created: ${reportData.createdAt}

REPORT CONTENT
==============

${reportData.content}

---
Generated on: ${new Date().toLocaleString()}
    `.trim();
  };

  const downloadAsText = () => {
    const content = generateReportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-report-${report.id}-${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title} - Event Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            color: #333;
        }
        .header { 
            border-bottom: 2px solid #007bff; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .title { 
            color: #007bff; 
            font-size: 2em; 
            margin-bottom: 10px;
            font-weight: bold;
        }
        .metadata { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-bottom: 30px;
        }
        .metadata-item { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #007bff;
        }
        .metadata-label { 
            font-weight: bold; 
            color: #666; 
            font-size: 0.9em; 
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .metadata-value { 
            font-size: 1.1em; 
            color: #333;
        }
        .content { 
            background: #fff; 
            padding: 30px; 
            border: 1px solid #dee2e6; 
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .content-title { 
            color: #333; 
            font-size: 1.5em; 
            margin-bottom: 20px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 10px;
        }
        .content-text { 
            white-space: pre-line; 
            line-height: 1.8;
        }
        .footer { 
            text-align: center; 
            color: #666; 
            font-size: 0.9em; 
            border-top: 1px solid #dee2e6; 
            padding-top: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-approved { background: #d4edda; color: #155724; }
        .status-submitted { background: #d1ecf1; color: #0c5460; }
        .status-draft { background: #fff3cd; color: #856404; }
        .status-rejected { background: #f8d7da; color: #721c24; }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${report.title}</h1>
        <p style="color: #666; margin: 0;">Event Report #${report.id}</p>
    </div>
    
    <div class="metadata">
        <div class="metadata-item">
            <div class="metadata-label">Event</div>
            <div class="metadata-value">${report.event.title}</div>
        </div>
        <div class="metadata-item">
            <div class="metadata-label">Report Type</div>
            <div class="metadata-value">${report.reportType.replace('_', ' ')}</div>
        </div>
        <div class="metadata-item">
            <div class="metadata-label">Status</div>
            <div class="metadata-value">
                <span class="status-badge status-${report.status.toLowerCase()}">${report.status}</span>
            </div>
        </div>
        <div class="metadata-item">
            <div class="metadata-label">Created</div>
            <div class="metadata-value">${new Intl.DateTimeFormat("en-US", {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).format(report.createdAt)}</div>
        </div>
        ${report.totalParticipants ? `
        <div class="metadata-item">
            <div class="metadata-label">Total Participants</div>
            <div class="metadata-value">${report.totalParticipants}</div>
        </div>
        ` : ''}
    </div>
    
    <div class="content">
        <h2 class="content-title">Report Content</h2>
        <div class="content-text">${report.content}</div>
    </div>
    
    <div class="footer">
        Generated on ${new Date().toLocaleString()}
    </div>
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-report-${report.id}-${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = () => {
    const csvContent = `"Field","Value"
"Report ID","${report.id}"
"Title","${report.title.replace(/"/g, '""')}"
"Event","${report.event.title.replace(/"/g, '""')}"
"Report Type","${report.reportType.replace('_', ' ')}"
"Status","${report.status}"
"Total Participants","${report.totalParticipants || 'N/A'}"
"Created","${new Intl.DateTimeFormat("en-US").format(report.createdAt)}"
"Content","${report.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-report-${report.id}-${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: 'text' | 'html' | 'csv') => {
    setIsDownloading(true);
    
    try {
      switch (format) {
        case 'text':
          downloadAsText();
          break;
        case 'html':
          downloadAsHTML();
          break;
        case 'csv':
          downloadAsCSV();
          break;
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => handleDownload('html')}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-400 transition-colors"
        title="Download Report as HTML"
        disabled={isDownloading}
      >
        {isDownloading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Image src="/upload.png" alt="Download" width={16} height={16} />
        )}
      </button>
    </div>
  );
};

export default EventReportDownload;
