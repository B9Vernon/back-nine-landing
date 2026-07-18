# Source adapters

Adapters describe permitted live behavior and useful manual fallbacks. They can
be inspected with `npx tsx src/cli.ts sources` and enabled per run with
`--sources`.

| Source | Default | Live policy | Safe fallbacks |
| --- | --- | --- | --- |
| Indeed Canada | Off | Manual import only | Saved HTML, copied text, CSV, JSON, URL exports |
| Government of Canada Job Bank | Off | Official API/feed | Official feed or manual exports |
| Castanet Classifieds Jobs | Off | Manual import only | Saved HTML, copied text, CSV, URL exports |
| WorkBC | Off | Public page only when permitted | Saved HTML, copied text, CSV, URLs |
| SimplyHired Canada | Off | Manual import only | Saved HTML, copied text, CSV, URLs |
| Workopolis | Off | Manual import only | Saved HTML, copied text, CSV, URLs |
| LinkedIn Canada | Off | Manual import only | Saved/exported public results, copied text, CSV |
| Glassdoor Canada | Off | Manual import only | Saved HTML, copied text, CSV, URLs |
| ZipRecruiter Canada | Off | Manual import only | Saved HTML, copied text, CSV, URLs |
| Eluta.ca | Off | Manual import only | Saved HTML, copied text, CSV, URLs |
| Company career pages | On | Permitted public page | Saved HTML, copied text, CSV, JSON, URLs |
| Search results | On | Approved API/feed | Exported HTML, copied text, CSV, JSON |
| Manual HTML/CSV/JSON/TXT | On | Local import | Operator-supplied files |

"Off" means the source is never fetched automatically. Its exports remain fully
useful: the job board supplies the hiring signal, then official-company research
and contact discovery continue independently.

## Common normalized fields

`companyName`, `jobTitle`, `jobLocation`, `city`, `postalCode`, `source`,
`sourceUrl`, `postingDate`, `rawText`, `website`, `companyDescription`,
`publicEmail`, `contactUrl`, `phone`, `address`, `latitude`, and `longitude`.

CSV header aliases such as `company`, `employer`, `title`, `role`, `location`,
`job_url`, `description`, and `email` are accepted.

## HTML behavior

The parser prioritizes schema.org `JobPosting` JSON-LD and falls back to common
job-card attributes/classes. Saved pages with custom markup can be converted to
CSV or copied-text blocks without adding source-specific scraping code.

## Source policy

Policies are configuration, not permission claims. Before enabling any live
source, confirm its current terms, robots rules, and public-access conditions.
The engine never bypasses a technical or contractual restriction.
