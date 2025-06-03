import React from "react";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface ApprovalBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

const ApprovalBadge: React.FC<ApprovalBadgeProps> = ({ status, className = "" }) => {
  const getStatusStyles = (status: ApprovalStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: ApprovalStatus) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      case "CANCELLED":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
        status
      )} ${className}`}
    >
      {getStatusText(status)}
    </span>
  );
};

export default ApprovalBadge;
