# Yigda

## Product purpose

Yigda is a national-scale, blockchain-anchored document verification platform for Bhutan. It links three institutional flows on one stack:

1. **Approved organizations** (universities, schools, hospitals, ministries, regulators) **issue** PDF documents that are hashed and anchored on Sepolia and stored via Cloudinary.
2. **Citizens** sign in with **Bhutan NDI** and keep their issued documents in a personal **vault**. They generate scoped, expiring share links.
3. **Verifier companies** subscribe via Stripe and consume credits to verify uploaded PDFs or open citizen share links.
4. **Admins** approve organizations, assign permitted document types, and manage verifier companies.

`register: product` (this is application UI; design serves the task).

## Users

- **Citizen.** Bhutanese resident with an NDI identity, reading a vault on a phone or laptop, sharing one credential at a time with an employer or HR. Trust matters more than density.
- **Organization officer.** Records clerk at a university or ministry, issues degrees / medical certificates / permits in single or bulk. Wants speed and a clear receipt that the chain caught it.
- **Verifier company.** HR or background-check team. Subscribes per-credit. Wants verification to feel instant and unambiguous.
- **Admin.** A small group inside the Yigda program. Approves new institutions and curates the document-type registry. Density and accuracy beat polish.

## Tone

- Official, calm, government-grade. This is a credential system; users transact identity, not enthusiasm.
- Bhutanese heritage is part of the brand promise (the logo carries dharma wheels, dragons, the tree of life). The UI nods to it through palette and one or two ornamental moments, not by decorating every surface.
- Plain language. Never "magic", never "powered by AI", never marketing exclamations inside the product.

## Anti-references

- **Crypto-bro neon** (no neon green/black, no glassmorphism, no "Web3" ornament).
- **Pastel SaaS** (no soft purple gradients, no rounded cartoon shapes — the old org dashboard's purple was an accident, not a brand).
- **Government default beige** (we are not a 2008 PDF portal).
- **Hero metric template** (no big-number-small-label dashboards).
- **Side-stripe accent borders, gradient text, identical card grids.**

## Strategic principles

- The seal IS the brand. The logo (teal + crimson + gold, Bhutanese heritage motifs) is the strongest asset; build the palette around it instead of muting it.
- Documents should feel like documents. Ivory paper surfaces, restrained ink, gold seal moments, hash strings in a real monospaced font.
- Light theme. Government clerks and university registrars work in daylit offices; dark mode would feel borrowed from another category.
- Familiar product affordances over invented ones. A verifier should never have to learn a new pattern to do a known task.
