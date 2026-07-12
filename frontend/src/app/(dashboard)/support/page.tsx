"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

interface FAQ {
  q: string;
  a: string;
  category: "booking" | "transfers" | "general";
}

const FAQS: FAQ[] = [
  {
    q: "How do I request an asset transfer?",
    a: "Go to the 'Agree Requests' page, select the asset you want to transfer, choose the recipient, and submit. The transfer will route to the Department Head, and then to the Asset Manager for final sign-off.",
    category: "transfers",
  },
  {
    q: "How do I book a meeting room or vehicle?",
    a: "Navigate to 'Resource Booking', select the category tab (e.g., Room or Vehicle), click on any free calendar grid block, set the duration, and click 'Confirm Booking'.",
    category: "booking",
  },
  {
    q: "What should I do if an asset is damaged?",
    a: "Go to the Maintenance page (or use the ticket form below) and raise a maintenance ticket. A technician will be assigned to repair the asset, and its status will change to 'Under Service'.",
    category: "general",
  },
];

export default function SupportPage() {
  const [activeFaqTab, setActiveFaqTab] = useState<"all" | "booking" | "transfers" | "general">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "bot"; text: string; data?: any[] }[]>([
    {
      sender: "bot",
      text: "Hello! I am your AI Asset Assistant. You can ask me natural language questions like:\n- 'Which assets are available?'\n- 'Find all laptops'\n- 'Where is Conference Room A?'\n- 'Who has the water cooler ticket?'",
    },
  ]);
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Ticket Form States
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketAssetId, setTicketAssetId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      const assetsData = await apiFetch("/assets?limit=150");
      setAssets(assetsData.data || []);
      const ticketData = await apiFetch("/maintenance");
      setTickets(ticketData);
      const usersData = await apiFetch("/auth/users");
      setUsers(usersData);
    } catch (err) {
      console.error("Error loading support helper data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAskAssistant = (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const query = presetQuery || searchQuery;
    if (!query.trim()) return;

    // Add user message
    const userMsg = { sender: "user" as const, text: query };
    setChatHistory((prev) => [...prev, userMsg]);
    setSearchQuery("");
    setIsTyping(true);

    // AI Natural Language Parsing Rules
    setTimeout(() => {
      setIsTyping(false);
      const normalized = query.toLowerCase();
      let reply = "";
      let foundData: any[] = [];

      if (normalized.includes("available") || normalized.includes("free") || normalized.includes("storage")) {
        const available = assets.filter((a) => a.status === "AVAILABLE");
        if (available.length > 0) {
          reply = `I found ${available.length} available assets currently in storage. Here are some of them:`;
          foundData = available.slice(0, 5).map((a) => ({
            tag: a.assetTag,
            name: a.name,
            location: a.location?.name || "Storage",
            status: "Available",
          }));
        } else {
          reply = "There are currently no assets marked as 'Available' in the database.";
        }
      } else if (normalized.includes("maintenance") || normalized.includes("repair") || normalized.includes("broken")) {
        const maint = tickets.filter((t) => t.status !== "RESOLVED");
        if (maint.length > 0) {
          reply = `I found ${maint.length} active maintenance tickets in the pipeline:`;
          foundData = maint.slice(0, 5).map((t) => ({
            title: t.title,
            asset: t.asset?.name || "Asset",
            status: t.status.replace("_", " "),
            assignee: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : "Unassigned",
          }));
        } else {
          reply = "Great news! There are no active maintenance tickets right now.";
        }
      } else if (normalized.includes("laptop") || normalized.includes("computer") || normalized.includes("thinkpad") || normalized.includes("macbook")) {
        const laptops = assets.filter((a) => a.name.toLowerCase().includes("laptop") || a.name.toLowerCase().includes("macbook") || a.name.toLowerCase().includes("thinkpad"));
        if (laptops.length > 0) {
          reply = `I found ${laptops.length} laptop assets registered in the workspace:`;
          foundData = laptops.slice(0, 5).map((a) => {
            const holder = a.allocations && a.allocations.length > 0
              ? `${a.allocations[0].allocatedTo?.firstName} ${a.allocations[0].allocatedTo?.lastName}`
              : "In Storage";
            return {
              tag: a.assetTag,
              name: a.name,
              status: a.status,
              holder,
            };
          });
        } else {
          reply = "No laptop assets found in the system registry.";
        }
      } else if (normalized.includes("where is") || normalized.includes("location of")) {
        // extract keyword
        const term = normalized.replace("where is", "").replace("location of", "").trim();
        const found = assets.find((a) => a.name.toLowerCase().includes(term) || a.assetTag.toLowerCase().includes(term));
        if (found) {
          reply = `Asset **${found.name} (${found.assetTag})** is located at **${found.location?.name || "Storage"}**.\nCondition: ${found.condition}.\nStatus: ${found.status}.`;
        } else {
          reply = `I couldn't find any asset matching '${term}' to determine its location. Please specify the tag or name.`;
        }
      } else if (normalized.includes("who has") || normalized.includes("held by") || normalized.includes("allocated to")) {
        const term = normalized.replace("who has", "").replace("held by", "").replace("allocated to", "").trim();
        const matchedUser = users.find((u) => u.firstName.toLowerCase().includes(term) || u.lastName.toLowerCase().includes(term));
        if (matchedUser) {
          // Find assets allocated to this user
          const userAllocations = assets.filter((a) => a.allocations && a.allocations.some((al: any) => al.allocatedToId === matchedUser.id && al.status === "ACTIVE"));
          if (userAllocations.length > 0) {
            reply = `**${matchedUser.firstName} ${matchedUser.lastName}** is currently holding the following ${userAllocations.length} assets:`;
            foundData = userAllocations.map((a) => ({
              tag: a.assetTag,
              name: a.name,
              location: a.location?.name || "Desk",
            }));
          } else {
            reply = `**${matchedUser.firstName} ${matchedUser.lastName}** does not have any assets allocated to them right now.`;
          }
        } else {
          reply = `I couldn't find any employee in the registry matching '${term}'.`;
        }
      } else {
        // general keyword fallback search
        const match = assets.filter((a) => a.name.toLowerCase().includes(normalized) || a.assetTag.toLowerCase().includes(normalized));
        if (match.length > 0) {
          reply = `I found ${match.length} assets matching your search term:`;
          foundData = match.slice(0, 5).map((a) => ({
            tag: a.assetTag,
            name: a.name,
            location: a.location?.name || "Storage",
            status: a.status,
          }));
        } else {
          reply = "I'm not sure how to answer that. Try asking about asset availability, locations, maintenance tickets, or holders (e.g. 'Who has Priya?').";
        }
      }

      setChatHistory((prev) => [...prev, { sender: "bot", text: reply, data: foundData }]);
    }, 800);
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc || !ticketAssetId) return;

    try {
      await apiFetch("/maintenance", {
        method: "POST",
        body: JSON.stringify({
          title: `Support: ${ticketTitle}`,
          description: ticketDesc,
          assetId: ticketAssetId,
          priority: "Medium",
        }),
      });

      setTicketTitle("");
      setTicketDesc("");
      setTicketAssetId("");
      setSuccessMsg("✓ Support request logged successfully as a service ticket.");
      setTimeout(() => setSuccessMsg(""), 4000);
      loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredFaqs = FAQS.filter((faq) => activeFaqTab === "all" || faq.category === activeFaqTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
          Help & Support Portal
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Interact with our AI Assistant, search resource articles, or create support tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: AI Assistant Chat */}
        <div className="lg:col-span-3 glass-card rounded-xl p-5 flex flex-col h-[520px] bg-surface shadow-md">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
            </div>
            <div>
              <h3 className="font-semibold text-on-surface text-sm">AI Asset Assistant</h3>
              <p className="text-[10px] text-primary font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Online & Syncing
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${chat.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                    chat.sender === "user"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container border-outline-variant/40 text-on-surface"
                  }`}
                >
                  {chat.text}
                </div>

                {/* Display assistant structured response data */}
                {chat.data && chat.data.length > 0 && (
                  <div className="w-full mt-2 space-y-1.5 max-w-[90%]">
                    {chat.data.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-[11px] flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-on-surface">
                            {item.name || item.title || item.asset}
                          </p>
                          <p className="text-on-surface-variant font-mono text-[9px] mt-0.5">
                            {item.tag || item.status} {item.location && `— ${item.location}`}
                          </p>
                        </div>
                        {item.holder && (
                          <span className="bg-secondary/15 text-secondary px-1.5 py-0.5 rounded text-[8px] font-bold">
                            {item.holder}
                          </span>
                        )}
                        {item.assignee && (
                          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-mono">
                            {item.assignee}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleAskAssistant} className="flex gap-2 border-t border-outline-variant/30 pt-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask me: 'Who has priority?', 'Where is water cooler?'..."
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            <button
              type="submit"
              className="bg-primary text-on-primary px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              Ask
            </button>
          </form>
        </div>

        {/* Right Side: FAQs & Create Ticket */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ Scopes */}
          <div className="glass-card rounded-xl p-5 space-y-4 bg-surface shadow-md">
            <h3 className="font-semibold text-on-surface text-sm border-b border-outline-variant pb-2">
              Frequently Asked Questions
            </h3>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5">
              {(["all", "booking", "transfers", "general"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFaqTab(tab)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                    activeFaqTab === tab
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className="space-y-1">
                  <h4 className="text-xs font-semibold text-on-surface">{faq.q}</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Create support ticket */}
          <div className="glass-card rounded-xl p-5 space-y-4 bg-surface shadow-md">
            <h3 className="font-semibold text-on-surface text-sm border-b border-outline-variant pb-2">
              Raise Support Ticket
            </h3>

            {successMsg && (
              <div className="bg-secondary/10 border border-secondary/25 text-secondary text-xs p-2.5 rounded-lg font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateSupportTicket} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">
                  Title / Subject
                </label>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g. WiFi failing or Printer jammed"
                  className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">
                  Select Associated Asset
                </label>
                <select
                  required
                  value={ticketAssetId}
                  onChange={(e) => setTicketAssetId(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded px-2.5 py-2 text-xs text-on-surface outline-none cursor-pointer focus:ring-1 focus:ring-primary"
                >
                  <option value="">Choose asset...</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.assetTag})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">
                  Details / Issue
                </label>
                <textarea
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  rows={2}
                  placeholder="Provide precise details of your support request..."
                  className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 text-xs text-on-surface outline-none resize-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-secondary text-on-secondary font-bold py-2 rounded text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Log Ticket
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
