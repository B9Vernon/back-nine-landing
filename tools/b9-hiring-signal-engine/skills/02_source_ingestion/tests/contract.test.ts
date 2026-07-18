import test from "node:test";
import assert from "node:assert/strict";
import { parseCopiedText, parseCsvJobs, parseHtmlJobs, parseJsonJobs } from "../index.js";

test("source ingestion normalizes CSV, JSON, copied text, and JobPosting HTML", () => {
  assert.equal(parseCsvJobs("company,job_title,location\nExample Co,Sales Rep,VERNON BC\n").length, 1);
  assert.equal(parseJsonJobs('[{"company":"Example Co","title":"Manager"}]')[0]?.companyName, "Example Co");
  assert.equal(parseCopiedText("Company: Example Co\nJob Title: Server\nLocation: Vernon, BC").length, 1);
  const html = `<script type="application/ld+json">{"@type":"JobPosting","title":"Cook","hiringOrganization":{"name":"Example Co"},"jobLocation":{"address":{"addressLocality":"Vernon"}}}</script>`;
  assert.equal(parseHtmlJobs(html, "https://jobs.example/posting")[0]?.jobTitle, "Cook");
});
