"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { apiFetch } from "@/lib/api";
import { useWebsockets } from "@/hooks/useWebsockets";

// --- Types ---
interface Booking {
  id: string;
  resource: string;
  title: string;
  day: number; // 0-6 index into the week
  startHour: number; // 8-17
  endHour: number;
  bookedBy: string;
  color: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  icon: string;
}

const COLORS = [
  "bg-primary/20 border-primary/40 text-primary",
  "bg-secondary/20 border-secondary/40 text-secondary",
  "bg-tertiary/20 border-tertiary/40 text-tertiary",
  "bg-error/15 border-error/30 text-error",
  "bg-primary/15 border-primary/30 text-primary",
];

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 8..18
const DAYS_COUNT = 5; // Mon-Fri

export default function BookingPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [modalSlot, setModalSlot] = useState<{ day: number; hour: number } | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formStartHour, setFormStartHour] = useState(8);
  const [formEndHour, setFormEndHour] = useState(9);
  const [formResource, setFormResource] = useState("");
  const [collision, setCollision] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekDays = useMemo(
    () => Array.from({ length: DAYS_COUNT }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Load resources (bookable assets)
  const loadResources = async () => {
    try {
      const res = await apiFetch("/assets?isBookable=true&limit=100");
      const mapped = res.data.map((asset: any) => ({
        id: asset.id,
        name: asset.name,
        type: asset.category?.code === "ROOM" ? "Room" : asset.category?.code === "VEHICLE" ? "Vehicle" : "Equipment",
        icon: asset.category?.code === "ROOM" ? "meeting_room" : asset.category?.code === "VEHICLE" ? "directions_car" : "science",
      }));
      setResources(mapped);
      if (mapped.length > 0) {
        setSelectedResource(mapped[0].id);
      }
    } catch (err) {
      console.error("Error loading resources:", err);
    }
  };

  // Load bookings for selected asset
  const loadBookings = useCallback(async () => {
    if (!selectedResource) return;
    try {
      const data = await apiFetch(`/bookings?assetId=${selectedResource}`);
      const mapped = data.map((b: any, index: number) => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);

        // Calculate day index relative to weekStart (Monday = 0)
        // Set hours to 0 to compare days properly
        const startDay = new Date(start);
        startDay.setHours(0, 0, 0, 0);
        const refDay = new Date(weekStart);
        refDay.setHours(0, 0, 0, 0);

        const dayDiff = Math.round((startDay.getTime() - refDay.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: b.id,
          resource: b.assetId,
          title: `Reserved by ${b.bookedBy?.firstName || "Staff"}`,
          day: dayDiff,
          startHour: start.getHours(),
          endHour: end.getHours(),
          bookedBy: `${b.bookedBy?.firstName || ""} ${b.bookedBy?.lastName || ""}`,
          color: COLORS[index % COLORS.length],
        };
      });
      // Filter out bookings that don't fall in this week's grid representation
      setBookings(mapped.filter((b: any) => b.day >= 0 && b.day < DAYS_COUNT));
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  }, [selectedResource, weekStart]);

  // Initial load
  useEffect(() => {
    loadResources();
  }, []);

  // Reload bookings when selected resource changes
  useEffect(() => {
    loadBookings();
  }, [selectedResource, loadBookings]);

  // Real-time synchronization
  useWebsockets({
    onDashboardRefresh: () => {
      loadBookings();
    },
  });

  const filteredBookings = useMemo(
    () => bookings.filter((b) => b.resource === selectedResource),
    [bookings, selectedResource]
  );

  const getBookingForSlot = (day: number, hour: number) =>
    filteredBookings.find((b) => b.day === day && hour >= b.startHour && hour < b.endHour);

  const isSlotStart = (day: number, hour: number) =>
    filteredBookings.find((b) => b.day === day && b.startHour === hour);

  const checkCollisionLocal = (day: number, start: number, end: number) =>
    filteredBookings.some(
      (b) =>
        b.day === day &&
        start < b.endHour &&
        end > b.startHour
    );

  const handleSlotClick = (day: number, hour: number) => {
    const existing = getBookingForSlot(day, hour);
    if (existing) return;

    setModalSlot({ day, hour });
    setFormStartHour(hour);
    setFormEndHour(Math.min(hour + 1, 18));
    setFormResource(selectedResource);
    setFormTitle("");
    setCollision(false);
    setErrorMsg("");
    setShowModal(true);
  };

  const handleTimeChange = (start: number, end: number) => {
    setFormStartHour(start);
    setFormEndHour(end);
    setCollision(checkCollisionLocal(modalSlot?.day ?? 0, start, end));
  };

  const handleSubmitBooking = async () => {
    if (!modalSlot || collision || formEndHour <= formStartHour) return;

    const start = new Date(weekDays[modalSlot.day]);
    start.setHours(formStartHour, 0, 0, 0);
    const end = new Date(weekDays[modalSlot.day]);
    end.setHours(formEndHour, 0, 0, 0);

    try {
      setErrorMsg("");
      await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          assetId: formResource,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      });

      setShowModal(false);
      setSuccessMsg(`✓ Booked successfully.`);
      setTimeout(() => setSuccessMsg(""), 3500);
      loadBookings();
    } catch (err: any) {
      setErrorMsg(err.message || "Collision or server error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
            Resource Booking
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Book shared facilities with overlap collision detection.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Week of {format(weekStart, "MMM d, yyyy")}
        </div>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-secondary/10 border border-secondary/30 rounded-xl p-3 flex items-center gap-3 text-secondary text-sm font-semibold"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              event_available
            </span>
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resource Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {resources.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedResource(r.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedResource === r.id
                ? "bg-primary text-on-primary border-primary shadow-md"
                : "bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/30"
            }`}
          >
            <span className="material-symbols-outlined text-base">{r.icon}</span>
            {r.name}
          </button>
        ))}
        {resources.length === 0 && (
          <div className="text-xs text-on-surface-variant italic py-2">
            No bookable resources found. Register an asset and mark it bookable first.
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day Header */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-outline-variant">
              <div className="p-3 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest flex items-center justify-center border-r border-outline-variant/30">
                Time
              </div>
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={`p-3 text-center border-r border-outline-variant/30 last:border-r-0 ${
                    isSameDay(day, new Date())
                      ? "bg-primary/5"
                      : ""
                  }`}
                >
                  <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                    {format(day, "EEE")}
                  </p>
                  <p className={`text-lg font-bold mt-0.5 ${
                    isSameDay(day, new Date()) ? "text-primary" : "text-on-surface"
                  }`}>
                    {format(day, "d")}
                  </p>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-outline-variant/20 last:border-b-0"
              >
                <div className="p-2 text-[10px] font-mono text-on-surface-variant flex items-start justify-center pt-3 border-r border-outline-variant/30">
                  {`${hour.toString().padStart(2, "0")}:00`}
                </div>
                {Array.from({ length: DAYS_COUNT }, (_, dayIdx) => {
                  const booking = getBookingForSlot(dayIdx, hour);
                  const isStart = isSlotStart(dayIdx, hour);
                  const isOccupied = !!booking;

                  return (
                    <div
                      key={dayIdx}
                      onClick={() => !isOccupied && selectedResource && handleSlotClick(dayIdx, hour)}
                      className={`relative min-h-[52px] border-r border-outline-variant/20 last:border-r-0 transition-colors ${
                        isSameDay(weekDays[dayIdx], new Date()) ? "bg-primary/[0.02]" : ""
                      } ${
                        !isOccupied && selectedResource
                          ? "hover:bg-primary/5 cursor-pointer group"
                          : ""
                      }`}
                    >
                      {isStart && booking && (
                        <div
                          className={`absolute inset-x-1 top-1 rounded-lg border px-2 py-1.5 z-10 ${booking.color}`}
                          style={{ height: `${(booking.endHour - booking.startHour) * 52 - 8}px` }}
                        >
                          <p className="text-[11px] font-semibold truncate">{booking.title}</p>
                          <p className="text-[9px] opacity-70 truncate">{booking.bookedBy}</p>
                        </div>
                      )}
                      {!isOccupied && selectedResource && (
                        <div className="absolute inset-1 rounded-lg border-2 border-dashed border-transparent group-hover:border-primary/20 flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-primary/0 group-hover:text-primary/30 text-sm transition-all">
                            add
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && modalSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl bg-surface"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-hanken font-bold text-xl text-on-surface">Book Resource</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="bg-surface-container border border-outline-variant rounded-lg p-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {format(weekDays[modalSlot.day], "EEEE, MMM d")}
                  </p>
                  <p className="text-xs text-on-surface-variant font-mono">
                    Slot starting at {`${modalSlot.hour.toString().padStart(2, "0")}:00`}
                  </p>
                </div>
              </div>

              {/* Collision / Server Error Warning */}
              <AnimatePresence>
                {(collision || errorMsg) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-error/10 border border-error/25 rounded-xl p-3 flex items-center gap-2 text-error overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-lg">warning</span>
                    <span className="text-xs font-semibold">
                      {errorMsg || "Time slot conflict detected! This slot overlaps with an existing booking."}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                    Start
                  </label>
                  <select
                    value={formStartHour}
                    onChange={(e) => handleTimeChange(Number(e.target.value), formEndHour)}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                  >
                    {HOURS.slice(0, -1).map((h) => (
                      <option key={h} value={h}>
                        {`${h.toString().padStart(2, "0")}:00`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                    End
                  </label>
                  <select
                    value={formEndHour}
                    onChange={(e) => handleTimeChange(formStartHour, Number(e.target.value))}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                  >
                    {HOURS.slice(1).map((h) => (
                      <option key={h} value={h} disabled={h <= formStartHour}>
                        {`${h.toString().padStart(2, "0")}:00`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmitBooking}
                disabled={collision || formEndHour <= formStartHour}
                className="w-full bg-primary text-on-primary font-bold px-4 py-3 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">event_available</span>
                Confirm Booking
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
