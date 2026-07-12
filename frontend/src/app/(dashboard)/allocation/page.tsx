"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function AllocationPage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Asset Allocation & Transfer"
        description="Allocate inventory items to personnel, trigger multi-stage department transfer approvals, and process check-in returns."
        icon="assignment_ind"
      />
    </div>
  );
}
