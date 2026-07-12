"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function AssetsPage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Asset Directory"
        description="Register physical items, upload documentation/photos, generate unique QR/barcodes, and view active lifecycle statuses."
        icon="inventory_2"
      />
    </div>
  );
}
