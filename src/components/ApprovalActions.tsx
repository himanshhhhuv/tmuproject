"use client";

import { useState } from "react";
import ApprovalModal from "./ApprovalModal";
import { Event } from "@prisma/client";

interface ApprovalActionsProps {
  event: Event;
  onEventUpdate?: () => void;
}

const ApprovalActions = ({ event, onEventUpdate }: ApprovalActionsProps) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
  }>({
    isOpen: false,
    type: null,
  });

  const openModal = (type: "approve" | "reject") => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  const handleSuccess = () => {
    onEventUpdate?.();
    // Refresh the page to show updated status
    window.location.reload();
  };

  // Only show buttons for pending events
  if (event.approvalStatus !== "PENDING") {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => openModal("approve")}
          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
          title="Approve Event"
        >
          ✓ Approve
        </button>
        <button
          onClick={() => openModal("reject")}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          title="Reject Event"
        >
          ✗ Reject
        </button>
      </div>

      {modalState.isOpen && modalState.type && (
        <ApprovalModal
          eventId={event.id}
          eventTitle={event.title}
          type={modalState.type}
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default ApprovalActions;
