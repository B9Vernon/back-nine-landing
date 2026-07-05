// Turns NIB2's written answer into a spoken version that sounds intentional.
// The dashboard still displays the full answer; ElevenLabs gets this cleaned,
// paced, chunked text instead of raw markdown.

export const CODE_OMISSION =
  "NIB, I wrote the code and put it on screen. Reading the whole thing aloud would be an act of cruelty.";

const DEFAULT_MAX_CHUNK_CHARS = 420;
const LONG_SPEECH_LIMIT = 1400;

export function createDisplayText(text) {
  return String(text || "").trim();
}

export function supportsSsmlBreaks(modelId = "", pauseMode = "punctuation") {
  const wantsBreakTags = ["ssml", "break-tags"].includes(String(pauseMode || "").toLowerCase());
  return wantsBreakTags && !/v3/i.test(String(modelId || ""));
}

export function formatListsForSpeech(text) {
  const lines = String(text || "").split(/\r?\n/);
  const out = [];
  let list = [];

  function flushList() {
    if (!list.length) return;
    const openers = ["First", "Next", "Also", "Finally"];
    const spokenItems = list.slice(0, 4).map((item, index) => `${openers[index] || "Also"}, ${item}`);
    if (list.length > 4) spokenItems.push("The remaining details are on screen.");
    out.push(spokenItems.join(". ") + ".");
    list = [];
  }

  for (const line of lines) {
    const match = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+)$/);
    if (match) {
      list.push(match[1].trim());
      continue;
    }
    flushList();
    out.push(line);
  }
  flushList();
  return out.join("\n");
}

export function stripMarkdownForSpeech(text, { readCodeAloud = false } = {}) {
  let out = String(text || "");
  out = out.replace(/```[\s\S]*?```/g, readCodeAloud ? (block) => block.replace(/```[a-zA-Z0-9_-]*\n?/g, "") : ` ${CODE_OMISSION} `);
  out = out.replace(/`([^`]+)`/g, "$1");
  out = out.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  out = out.replace(/\bhttps?:\/\/\S+/gi, "");
  out = out.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  out = out.replace(/^\s{0,3}>\s?/gm, "");
  out = out.replace(/[*_~#>|]/g, " ");
  out = out.replace(/^\s*\|.*\|\s*$/gm, " Table detail is on screen. ");
  out = out.replace(/&amp;/g, " and ").replace(/&lt;/g, " less than ").replace(/&gt;/g, " greater than ");
  return out;
}

function normalizeDashesAndQuotes(text) {
  return String(text || "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, " - ")
    .replace(/\u2026/g, "...");
}

function sentencePieces(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.!?]+[.!?]+(?:\s*<break time="[0-9.]+s" \/>)*|[^.!?]+$/g) || [];
}

function ensureNibOnce(text) {
  let seen = false;
  let out = String(text || "").replace(/\bN\.?\s*I\.?\s*B\.?\b/gi, () => {
    if (!seen) {
      seen = true;
      return "NIB";
    }
    return "you";
  });
  if (!seen || out.search(/\bNIB\b/) > 80) out = `NIB, ${out}`;
  return out;
}

export function insertNaturalPauses(text, { useBreakTags = false } = {}) {
  let out = String(text || "").trim();
  if (!out) return "";

  if (useBreakTags) {
    out = out.replace(/^NIB,\s*/i, 'NIB, <break time="0.3s" /> ');
    out = out.replace(/:\s+/g, ': <break time="0.4s" /> ');
    out = out.replace(/\.\s+(That|Which|Naturally|Apparently)\b/g, '. <break time="0.6s" /> $1');
    out = out.replace(/\n{2,}/g, ' <break time="0.6s" /> ');
    return out;
  }

  out = out.replace(/^NIB,\s*/i, "NIB... ");
  out = out.replace(/:\s+/g, ". ");
  out = out.replace(/\.\s+(That|Which|Naturally|Apparently)\b/g, "... $1");
  out = out.replace(/\n{2,}/g, ". ");
  return out;
}

export function sanitizeTTSInput(text, { allowBreakTags = false } = {}) {
  let out = normalizeDashesAndQuotes(text);
  const breaks = [];
  if (allowBreakTags) {
    out = out.replace(/<break\s+time="(?:0\.3|0\.4|0\.6|0\.9|1\.0)s"\s*\/>/g, (tag) => {
      breaks.push(tag);
      return `@@BREAK_${breaks.length - 1}@@`;
    });
  }
  out = out.replace(/<[^>]+>/g, " ");
  out = out.replace(/[\u0000-\u001f\u007f]/g, " ");
  out = out.replace(/\s+/g, " ").trim();
  breaks.forEach((tag, index) => {
    out = out.replace(`@@BREAK_${index}@@`, tag);
  });
  return out.slice(0, 3200);
}

function shortenLongSpeech(text) {
  if (text.length <= LONG_SPEECH_LIMIT) return text;
  const pieces = sentencePieces(text);
  const summary = pieces.slice(0, 4).join(" ").trim();
  return `${summary} The full detail is on screen.`;
}

export function createSpokenText(displayText, options = {}) {
  const display = createDisplayText(displayText);
  if (!display) return "";

  const readCodeAloud = Boolean(options.readCodeAloud);
  const useBreakTags = Boolean(options.useBreakTags);
  let spoken = formatListsForSpeech(display);
  spoken = stripMarkdownForSpeech(spoken, { readCodeAloud });
  spoken = normalizeDashesAndQuotes(spoken);
  spoken = spoken.replace(/\s+/g, " ").trim();

  if (!spoken || spoken === CODE_OMISSION) spoken = CODE_OMISSION;
  spoken = ensureNibOnce(spoken);
  spoken = shortenLongSpeech(spoken);
  spoken = insertNaturalPauses(spoken, { useBreakTags });
  return sanitizeTTSInput(spoken, { allowBreakTags: useBreakTags });
}

export function chunkSpokenText(text, { maxChunkChars = DEFAULT_MAX_CHUNK_CHARS } = {}) {
  const pieces = sentencePieces(text);
  const chunks = [];
  let current = "";

  for (const piece of pieces) {
    const next = current ? `${current} ${piece.trim()}` : piece.trim();
    if (next.length <= maxChunkChars) {
      current = next;
      continue;
    }
    if (current) chunks.push(current.trim());
    if (piece.length > maxChunkChars) {
      const parts = piece.split(/,\s+|;\s+/);
      let sub = "";
      for (const part of parts) {
        const candidate = sub ? `${sub}, ${part}` : part;
        if (candidate.length > maxChunkChars && sub) {
          chunks.push(sub.trim());
          sub = part;
        } else {
          sub = candidate;
        }
      }
      current = sub;
    } else {
      current = piece.trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

export function prepareTextForTTS(text, options = {}) {
  const displayText = createDisplayText(text);
  const useBreakTags = supportsSsmlBreaks(options.modelId, options.pauseMode);
  const spokenText = createSpokenText(displayText, { ...options, useBreakTags });
  return {
    displayText,
    spokenText,
    chunks: chunkSpokenText(spokenText, { maxChunkChars: options.maxChunkChars }),
    pauseMode: useBreakTags ? "ssml" : "punctuation",
    usedBreakTags: useBreakTags,
  };
}
