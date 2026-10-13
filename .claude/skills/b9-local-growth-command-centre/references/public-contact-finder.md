# Public Contact Finder (shared skill)

For each prospect, find the best public contact path. Public business information only.

## Where to look

Official website, contact page, about page, team page, footer, booking page, public
inquiry form, public email, contact form, phone number, public Facebook page, public
Instagram profile, public LinkedIn company page, public tourism listing, public event
page, public directory listing.

## Contact quality classification

| Class | Meaning |
|---|---|
| HIGH CONFIDENCE | Direct owner, manager, organizer, or decision-maker email. |
| MEDIUM CONFIDENCE | General business, organization, hotel, accommodation, or event email. |
| USABLE | Contact form, inquiry page, or booking/contact form. |
| LOW CONFIDENCE | Only public social contact. |
| NO USABLE CONTACT | No public contact found. |

## Rules

- Do not discard a strong prospect only because the direct email is not obvious — but
  the final file must clearly state the contact method.
- No direct email but a contact form exists → write `CONTACT FORM: [URL]` in place of
  the email line.
- Only a public social path exists → write `SOCIAL CONTACT: [URL]`.

## Compliance boundaries

Never collect private personal data, scrape gated platforms, bypass logins, CAPTCHAs,
security systems, or platform restrictions. Never scrape private Airbnb data or hidden
host information, and never message hosts pretending to be a guest. Never automatically
scrape private Facebook groups or harvest private member data.
