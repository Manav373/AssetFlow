"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function BookingPage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Resource Booking Calendar"
        description="Book shared facilities, conference rooms, vehicles, or test equipment with overlap collision detection."
        icon="event_available"
      />
    </div>
  );
}
