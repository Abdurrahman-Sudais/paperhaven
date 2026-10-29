# Paperhaven

**Make every recovered-paper batch count.**

Paperhaven is a recovered-paper assessment and blend-planning platform for recycling businesses and paper mills. This repository contains the marketing website for [paperhaven.top](https://paperhaven.top) and an interactive frontend demonstration of the product.

- Founder: Ifeoma Ezeani
- Contact: [ifeoma@paperhaven.top](mailto:ifeoma@paperhaven.top)

## Stack

Vite · React · TypeScript · Tailwind CSS v4 · React Router · Lucide React · Recharts · Vitest

No API keys, paid services or backend are required. The demo runs on local sample data and React state, with scenarios persisted to `localStorage`.

## Getting started

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # start the dev server at http://localhost:5173
npm test           # run the calculation unit tests
npm run build      # type-check and build to dist/
npm run preview    # serve the production build locally
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/product` | Product |
| `/blend-planner` | Blend Planner (marketing page) |
| `/how-it-works` | How It Works |
| `/solutions` | Industry Solutions |
| `/pricing` | Pricing (proposed) |
| `/about` | About |
| `/contact` | Contact |
| `/planner` | Interactive demo: Overview |
| `/planner/batches` | Incoming Batches |
| `/planner/blend` | Blend Planner |
| `/planner/specifications` | Specifications |
| `/planner/reports` | Reports |
| `/planner/settings` | Settings |

This is a client-side routed SPA. Hosting needs to rewrite unknown paths to `index.html`; `public/_redirects` (Netlify) and `vercel.json` (Vercel) are included.

## Project structure

```
src/
  types.ts                 Domain types: Batch, Measurement, BlendScenario, ProductionSpecification
  data/demo.ts             Fictional sample batches, scenarios, specification and inspection document
  lib/
    calculations.ts        Blend calculations (pure, deterministic, tested)
    specCheck.ts           Specification checker against user-configured ranges
    batches.ts             Completeness checks, form validation, filtering and sorting
    simulatedAi.ts         Rule-based stand-in for AI assistance
    calculations.test.ts   Unit tests for all of the above
    storage.ts, format.ts, usePageMeta.ts
  state/PlannerContext.tsx Demo workspace state and localStorage persistence
  components/ui/           Reusable Button, Card, Badge, Modal, Field, DataTable, Provenance tags
  components/site/         Marketing layout, sections, product preview, material plates
  pages/                   Marketing pages
  app/                     Planner screens, lazy-loaded
```

## How the calculations work

All calculations live in `src/lib/calculations.ts` and are independent of the UI.

| Result | Formula |
| --- | --- |
| Tonnes from batch *i* | planned quantity × proportionᵢ ÷ 100 |
| Total blend quantity | Σ tonnesᵢ |
| Total material cost | Σ (tonnesᵢ × cost per tonneᵢ) |
| Weighted cost per tonne | total material cost ÷ total blend quantity |
| Weighted moisture | Σ (proportionᵢ × moistureᵢ) ÷ Σ proportionᵢ |
| Weighted non-paper content | Σ (proportionᵢ × non-paperᵢ) ÷ Σ proportionᵢ |

Rules:

- Proportions must total 100% (within 0.01 points). Otherwise no totals are calculated.
- A missing measurement is never replaced with zero. If any batch with a positive proportion lacks a valid value, that weighted average returns `unavailable`, along with the reason and the missing inputs. Batches at 0% do not contribute.
- If a blend draws more than a batch's available stock, it is flagged as an error.
- Every successful result carries a trace of its formula and inputs, which the UI shows under "How this is calculated".

The specification checker (`specCheck.ts`) only compares values against ranges the user has enabled and configured. Each check reports one of: within, outside, unavailable (input missing) or not configured. It contains no built-in industry standards. The demo thresholds are labelled as illustrative.

## What is functional, what is mock, and what needs a backend

**Functional in the browser**

- All eight marketing pages, with responsive navigation, per-route SEO metadata, `robots.txt`, `sitemap.xml` and JSON-LD.
- Batch inventory with search, grade, supplier and completeness filters, and sorting by cost, quantity and moisture. Batches without a moisture value always sort last.
- A batch detail panel that separates measured, operator-entered, AI-suggested and calculated values.
- Adding and editing batches, with validation.
- The Blend Planner: batch selection, sliders and numeric proportion inputs, a "split evenly" option, live calculations, a share chart, the specification check, and an issues list.
- Saving, opening, duplicating, deleting and comparing multiple scenarios, persisted in `localStorage`.
- An editable production specification with range validation.
- Reports: a scenario comparison table and chart, CSV export, and a print view.
- A contact form with client-side validation.

**Mock or simulated**

- All batches, suppliers, values and documents are fictional and labelled as demonstration data.
- The **AI assistance** panel is simulated with deterministic rules in `simulatedAi.ts`. No model is called. Its suggestions never write to records: extracted values can only open the edit form for a person to review, and measured values that differ are kept.
- **Document attachments** record a name and type only. No file is uploaded.
- The **contact form** does not send anything. It validates, then points users to the email address.
- **Pricing** is proposed and illustrative. There is no checkout.
- The illustrations are SVG "material plates" rather than photographs. Replace them with licensed photography of real yards and mills in `components/site/MaterialScene.tsx`.

**Would require backend or AI integration**

- Multi-user accounts, authentication, roles and multi-site data (a database and API).
- File storage for inspection reports, weighbridge tickets and photos.
- Real document extraction and note summarisation through an LLM or OCR service. This should keep the same contract as the simulated version: suggestions only, a human reviews before saving, and nothing is inferred from photographs.
- Contact form delivery (an email service or CRM).
- Integrations with ERP or weighbridge systems, an audit trail of edits, and approval workflows.
