import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { PROJECT_ROOT } from "../src/config.js";

export interface TxtValidationResult {
  valid: boolean;
  blocks: number;
  errors: string[];
}

export function validateTxtContent(content: string): TxtValidationResult {
  const blocks = content.trim().split(/\r?\n\r?\n(?=COMPANY:)/).filter(Boolean);
  const errors: string[] = [];
  blocks.forEach((block, index) => {
    const number = index + 1;
    const labels = block.match(/^[A-Z ]+:/gm) || [];
    if (labels.join("|") !== "COMPANY:|EMAIL:|EMAIL SUBJECT:|EMAIL BODY:") errors.push(`Block ${number}: unexpected or missing labels.`);
    const body = block.split(/EMAIL BODY:\r?\n/)[1] || "";
    const company = block.match(/^COMPANY:\s*(.+)$/m)?.[1] || "";
    const requiredStart = `Hey ${company},\n\nI'm Neil, owner of Back Nine Golf here in Vernon.`;
    if (!body.replace(/\r\n/g, "\n").startsWith(requiredStart)) errors.push(`Block ${number}: required introduction does not match.`);
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    if (words < 150 || words > 250) errors.push(`Block ${number}: body is ${words} words; expected 150-250.`);
    if (/\b(sincerely|regards|cheers),?\s*$/i.test(body.trim())) errors.push(`Block ${number}: sign-off is not allowed.`);
  });
  if (blocks.length === 0) errors.push("No company blocks found.");
  return { valid: errors.length === 0, blocks: blocks.length, errors };
}

if (resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] || "")) {
  const parsed = parseArgs({ allowPositionals: true });
  const path = parsed.positionals[0];
  if (!path) {
    process.stderr.write("Usage: npm run validate:txt -- <path-to-output.txt>\n");
    process.exitCode = 1;
  } else {
    const result = validateTxtContent(readFileSync(resolve(PROJECT_ROOT, path), "utf8"));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.valid) process.exitCode = 1;
  }
}
