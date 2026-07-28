# Contact Finder — email or skip

For each discovered business, find a real EMAIL ADDRESS. If there isn't one,
the business is dropped from the run.

This replaces the old "best available contact path" rule, which let contact
forms and phone numbers through and produced lists Neil could not actually
send from.

## The rule (Neil, run 12)

> "I only want their email contact for the To: line. Contact forms are
> almost as useless as their phone number."

So:

- **Keep** a business only when a real email address is found in a public
  source.
- **Drop** a business whose only route is a contact form, a phone number, a
  social DM, or a site with no address published. Don't list it, don't log
  it, move to the next candidate.
- A contact page belongs in a `To:` line **only** if the form was actually
  submitted. This environment cannot submit forms, so that never applies
  here.

## Where the address comes from

One targeted query per business — see `email-first-discovery.md`:

```
"<Exact Business Name>" Vernon BC contact email
```

Aggregator pages that regularly expose an address inside the search snippet:
Chamber member listings, Alignable, Okanagan Local, YellowPages, Facebook
business "about" panes, and the business's own contact page.

## Address quality, best first

1. `owner-email` — a named owner or manager's address
2. `direct-email` — a role address the business publishes (`info@`,
   `hello@`, `sales@`, `office@`, `bookings@`)
3. `personal-provider` — a `@gmail.com` / `@shaw.ca` / `@telus.net` /
   `@outlook.com` address the business publishes as its own contact. Common
   for Vernon trades and sole operators, and perfectly good.

Anything below that is not a contact for this engine's purposes.

## Absolute rule

**Never pattern-guess.** Search results sometimes show a company's address
*format* (`{first}{last}@company.com`) or a redacted `[email protected]`.
Neither is an address. Building one from a domain is forbidden — it produces
bounces on a list Neil has to live with.
