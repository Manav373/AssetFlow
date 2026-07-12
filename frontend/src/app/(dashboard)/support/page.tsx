"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function SupportPage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Help & Support Portal"
        description="Search documentation articles, read user guides, or open technical assistance tickets with system administrators."
        icon="help"
      />
    </div>
  );
}
