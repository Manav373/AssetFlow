"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function AuditPage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Asset Verification & Audit"
        description="Schedule routine audit cycles, assign verification lists to auditors, flag missing items, and generate discrepancy reports."
        icon="fact_check"
      />
    </div>
  );
}
