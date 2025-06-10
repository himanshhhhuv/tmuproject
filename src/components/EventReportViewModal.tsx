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

interface EventReportViewModalProps {
  report: EventReport;
}

const EventReportViewModal = ({ report }: EventReportViewModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className={line.trim() === '' ? 'mb-4' : 'mb-2'}>
        {line}
      </p>
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'ATTENDANCE':
        return 'bg-blue-100 text-blue-800';
      case 'BUDGET':
        return 'bg-green-100 text-green-800';
      case 'FEEDBACK':
        return 'bg-purple-100 text-purple-800';
      case 'INCIDENT':
        return 'bg-red-100 text-red-800';
      case 'SUMMARY':
        return 'bg-orange-100 text-orange-800';
      case 'LOGISTICS':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* View Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky hover:bg-blue-400 transition-colors"
        title="View Report"
      >
        <Image src="/view.png" alt="View" width={16} height={16} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded">
                  <Image src="/result.png" alt="" width={20} height={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{report.title}</h2>
                  <p className="text-sm text-gray-500">Report ID: {report.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <Image src="/close.png" alt="Close" width={16} height={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Report Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Event</h4>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{report.event.title}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Type</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getReportTypeColor(report.reportType)}`}>
                    {report.reportType.replace('_', ' ')}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created</h4>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {new Intl.DateTimeFormat("en-US", {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(report.createdAt)}
                  </p>
                </div>
              </div>

              {/* Participants Count */}
              {report.totalParticipants && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
                      <span className="text-blue-600 font-semibold text-sm">👥</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Total Participants</h4>
                      <p className="text-2xl font-bold text-blue-600">{report.totalParticipants}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Report Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Content</h3>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  {formatContent(report.content)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Print functionality
                  window.print();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Image src="/upload.png" alt="" width={16} height={16} />
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventReportViewModal;
