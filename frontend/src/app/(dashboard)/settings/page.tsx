"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function SettingsPage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Settings & Configuration"
        description="Configure organizational defaults, custom asset tag sequences, alert reminders, notification presets, and user preferences."
        icon="settings"
      />
    </div>
  );
}
