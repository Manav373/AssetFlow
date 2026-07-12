
/**
 * @module ResourceBooking
 * @description Interactive calendar timeline for facility bookings with collision detection.
 * @authors Developer 4
 * @status In-Progress
 * @collaboration Frontend team consumes GET /api/bookings/slots payload
 */

"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

// --- Mock Data ---
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

const RESOURCES: Resource[] = [
  { id: "r1", name: "Conference Room A", type: "Room", icon: "meeting_room" },
  { id: "r2", name: "Conference Room B", type: "Room", icon: "meeting_room" },
  { id: "r3", name: "Conference Room C", type: "Room", icon: "meeting_room" },
  { id: "r4", name: "Vehicle V-01", type: "Vehicle", icon: "directions_car" },
  { id: "r5", name: "Lab Equipment LE-3", type: "Equipment", icon: "science" },
];

const COLORS = [
  "bg-primary/20 border-primary/40 text-primary",
  "bg-secondary/20 border-secondary/40 text-secondary",
  "bg-tertiary/20 border-tertiary/40 text-tertiary",
  "bg-error/15 border-error/30 text-error",
  "bg-primary/15 border-primary/30 text-primary",
];

const INITIAL_BOOKINGS: Booking[] = [
  { id: "b1", resource: "r1", title: "Sprint Planning", day: 0, startHour: 9, endHour: 11, bookedBy: "Priya Shah", color: COLORS[0] },
  { id: "b2", resource: "r1", title: "Stakeholder Sync", day: 2, startHour: 14, endHour: 15, bookedBy: "Arjun Mehta", color: COLORS[1] },
  { id: "b3", resource: "r2", title: "Design Review", day: 1, startHour: 10, endHour: 12, bookedBy: "Neha Kapoor", color: COLORS[2] },
  { id: "b4", resource: "r3", title: "Client Onboarding", day: 3, startHour: 13, endHour: 15, bookedBy: "Raj Patel", color: COLORS[3] },
  { id: "b5", resource: "r4", title: "Site Visit", day: 4, startHour: 8, endHour: 12, bookedBy: "Simran Kaur", color: COLORS[4] },
  { id: "b6", resource: "r2", title: "QA Review", day: 0, startHour: 14, endHour: 16, bookedBy: "Vikram Desai", color: COLORS[0] },
  { id: "b7", resource: "r5", title: "Lab Calibration", day: 2, startHour: 9, endHour: 11, bookedBy: "Simran Kaur", color: COLORS[1] },
];

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 8..18
const DAYS_COUNT = 5; // Mon-Fri

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [selectedResource, setSelectedResource] = useState<string>("r1");
  const [showModal, setShowModal] = useState(false);
  const [modalSlot, setModalSlot] = useState<{ day: number; hour: number } | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formStartHour, setFormStartHour] = useState(8);
  const [formEndHour, setFormEndHour] = useState(9);
  const [formResource, setFormResource] = useState("");
  const [collision, setCollision] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekDays = useMemo(
    () => Array.from({ length: DAYS_COUNT }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const filteredBookings = useMemo(
    () => bookings.filter((b) => b.resource === selectedResource),
    [bookings, selectedResource]
  );

  const getBookingForSlot = (day: number, hour: number) =>
    filteredBookings.find((b) => b.day === day && hour >= b.startHour && hour < b.endHour);

  const isSlotStart = (day: number, hour: number) =>
    filteredBookings.find((b) => b.day === day && b.startHour === hour);

  const checkCollision = (resource: string, day: number, start: number, end: number, excludeId?: string) =>
    bookings.some(
      (b) =>
        b.resource === resource &&
        b.day === day &&
        b.id !== excludeId &&
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
    setShowModal(true);
  };

  const handleTimeChange = (start: number, end: number) => {
    setFormStartHour(start);
    setFormEndHour(end);
    if (modalSlot) {
      setCollision(checkCollision(formResource, modalSlot.day, start, end));
    }
  };

  const handleResourceChange = (resId: string) => {
    setFormResource(resId);
    if (modalSlot) {
      setCollision(checkCollision(resId, modalSlot.day, formStartHour, formEndHour));
    }
  };

  const handleSubmitBooking = () => {
    if (!formTitle || !modalSlot || collision) return;

    const newBooking: Booking = {
      id: `b${Date.now()}`,
      resource: formResource,
      title: formTitle,
      day: modalSlot.day,
      startHour: formStartHour,
      endHour: formEndHour,
      bookedBy: "You",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    setBookings((prev) => [...prev, newBooking]);
    setShowModal(false);
    setSuccessMsg(`✓ "${formTitle}" booked successfully.`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const currentResource = RESOURCES.find((r) => r.id === selectedResource);

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
        {RESOURCES.map((r) => (
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
                      onClick={() => !isOccupied && handleSlotClick(dayIdx, hour)}
                      className={`relative min-h-[52px] border-r border-outline-variant/20 last:border-r-0 transition-colors ${
                        isSameDay(weekDays[dayIdx], new Date()) ? "bg-primary/[0.02]" : ""
                      } ${
                        !isOccupied
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
                      {!isOccupied && (
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
              className="glass-card rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl"
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

              {/* Collision Warning */}
              <AnimatePresence>
                {collision && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-error/10 border border-error/25 rounded-xl p-3 flex items-center gap-2 text-error overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-lg">warning</span>
                    <span className="text-xs font-semibold">
                      Time slot conflict detected! This slot overlaps with an existing booking.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  Booking Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Sprint Planning"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  Resource
                </label>
                <select
                  value={formResource}
                  onChange={(e) => handleResourceChange(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  {RESOURCES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

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
                disabled={!formTitle || collision || formEndHour <= formStartHour}
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
