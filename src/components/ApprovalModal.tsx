"use client";

import { approveEvent, rejectEvent } from "@/lib/actions";
import { useState } from "react";

interface ApprovalModalProps {
  eventId: number;
  eventTitle: string;
  type: "approve" | "reject";
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ApprovalModal = ({
  eventId,
  eventTitle,
  type,
  isOpen,
  onClose,
  onSuccess,
}: ApprovalModalProps) => {
  const [comments, setComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "approve") {
        await approveEvent(eventId, comments);
      } else {
        if (!rejectionReason.trim()) {
          alert("Please provide a rejection reason");
          return;
        }
        await rejectEvent(eventId, rejectionReason, comments);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setComments("");
      setRejectionReason("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {type === "approve" ? "Approve Event" : "Reject Event"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Event:</p>
          <p className="font-medium">{eventTitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {type === "reject" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Please provide a reason for rejection..."
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add any additional comments..."
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                type === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading
                ? "Processing..."
                : type === "approve"
                ? "Approve Event"
                : "Reject Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;
