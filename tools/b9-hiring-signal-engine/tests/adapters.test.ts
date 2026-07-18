import test from "node:test";
import assert from "node:assert/strict";
import { SOURCE_ADAPTERS } from "../src/adapters.js";

test("all requested job sources have an adapter policy", () => {
  const ids = SOURCE_ADAPTERS.map((adapter) => adapter.id);
  for (const id of ["indeed-ca", "job-bank", "castanet", "workbc", "simplyhired-ca", "workopolis", "linkedin-ca", "glassdoor-ca", "ziprecruiter-ca", "eluta", "company-careers", "search-results", "manual-html", "manual-csv", "manual-text"]) {
    assert.ok(ids.includes(id), `missing adapter ${id}`);
  }
  const restrictedBoards = ["indeed-ca", "castanet", "simplyhired-ca", "workopolis", "linkedin-ca", "glassdoor-ca", "ziprecruiter-ca", "eluta"];
  assert.ok(SOURCE_ADAPTERS.filter((adapter) => restrictedBoards.includes(adapter.id)).every((adapter) => !adapter.enabledByDefault));
});
