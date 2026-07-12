"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function MaintenancePage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Maintenance Management"
        description="Raise tickets, approve service events, assign technicians, track repair costs, and log task resolutions."
        icon="build"
      />
    </div>
  );
}
