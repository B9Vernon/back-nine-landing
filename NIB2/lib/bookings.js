// Today's bookings for the Command Centre.
//
// HONEST STATUS: the B9 booking admin (franchise.backninegolf.ca) is a
// login-protected app with no public API — there is no legitimate way for
// NIB2 to pull live bookings until B9 corporate provides API access or an
// export feed (NIB has to ask them — see README §5c). Until then this is a
// manual-sync structure: paste today's bookings in (or POST them), and the
// Command Centre displays them with an honest "manual" freshness label.
// The moment a real API exists, only fetchBookings() needs replacing.

import { readJson, writeJson } from "./store.js";

const FILE = "bookings.json";
const EMPTY = { updatedAt: null, source: "manual", bookings: [] };

export function readBookings() {
  const b = readJson(FILE, EMPTY);
  return {
    updatedAt: b.updatedAt ?? null,
    source: b.source ?? "manual",
    bookings: Array.isArray(b.bookings) ? b.bookings : [],
  };
}

// Replace today's bookings. Each booking: { time, bay, name, note } — all
// strings, all optional except time.
export function writeBookings(bookings, source = "manual") {
  if (!Array.isArray(bookings)) throw new Error("bookings must be an array.");
  const entry = {
    updatedAt: new Date().toISOString(),
    source: String(source),
    bookings: bookings.map((b) => ({
      time: String(b.time || ""),
      bay: String(b.bay || ""),
      name: String(b.name || ""),
      note: String(b.note || ""),
    })),
  };
  writeJson(FILE, entry);
  return entry;
}
