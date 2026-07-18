# Troubleshooting

## Node reports `node:sqlite` errors

Use Node.js 24 or newer, then reinstall:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

## A URL list will not import

URL lists require `--live`. If direct access is restricted, save/export the
results as HTML, copied text, CSV, or JSON and import the local file.

## A company is rejected as location unknown

Add `city`, `job_location`, or coordinates to the job input. City matches use an
approximate centroid and remain flagged uncertain.

## Kelowna or a golf course is missing

These are default exclusions. Only include them intentionally with
`--include-kelowna` or `--include-golf`.

## Research remains pending

Supply an official `website` field or `--website-map`. Add `--live` only when the
site permits public fetching. A mismatch between the company name and site title
also leaves research pending for manual verification.

## No email was found

The engine does not guess. Add evidence-backed `public_email` or `contact_url` to
the import, or run permitted official-site discovery with `--live`. Phone-only or
missing-contact records are excluded by default.

## `generate:emails` creates zero records

Run `review:list`, then explicitly approve suitable companies with a public email
or contact form. Approval and content generation are separate.

## `generate:txt` reports nothing is ready

Run these in order:

```powershell
npm run review:approve -- <company-id>
npm run generate:emails
npm run generate:txt
```

## A live page is blocked

Do not retry with bypass tooling. Use a public official API/feed or a manual saved
export. Audit history records the restriction without storing the page body.

## Reusing a database gives duplicate imports

Duplicate fingerprints are ignored intentionally. Start a separate campaign with
`--database ./data/cache/<name>.sqlite` or continue the existing run.
