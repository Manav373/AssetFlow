"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function OrgSetupPage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Organization Setup"
        description="Manage company profiles, department definitions, physical locations, and hierarchical employee directories."
        icon="corporate_fare"
      />
    </div>
  );
}
