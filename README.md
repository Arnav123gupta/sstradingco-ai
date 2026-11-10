# SSTradingCo AI — Flipkart Listing Studio

A seller-side workspace for preparing **new Flipkart product listings** with a mandatory human review step.

## Current MVP

- New listing form with product name, brand, category and seller SKU
- Local product image preview (up to 9 images)
- Price, MRP, stock and shipping fields
- Product description and additional-attribute draft fields
- Listing review modal
- Explicit draft-only state: no Flipkart API calls and no publishing

## Run locally

Requirements: Node.js 20+

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Important limitations

This is an initial frontend MVP. Form data is currently held in browser memory and is not persisted. The "Prepare description draft" action is a basic template helper, not an AI model integration. The dashboard does **not** connect to Flipkart and cannot create, submit, or publish a listing yet.

Before API integration, confirm the seller account's approved API access, current Flipkart listing schema for each category, authentication requirements, image upload flow, and permitted submission endpoints. Keep all credentials server-side in environment variables; never commit API secrets to Git.

## Publishing safety

The intended workflow is:

1. Enter verified product information and upload genuine product images.
2. Validate category-specific required attributes and commercial details.
3. Generate a preview.
4. Require explicit seller approval.
5. Submit only the approved listing through the official authorized API.
6. Track the actual response and QC status.

No submission should happen automatically before approval.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- lucide-react


## AI listing draft generation

The dashboard includes a server-side AI draft endpoint at `/api/generate-listing`. It sends only the seller-entered product facts to Vercel AI Gateway and requests a cautious JSON draft (title, description, keywords, and missing information). The server refuses to invent specifications and never exposes the gateway key to the browser.

Configure these environment variables in Vercel:

- `AI_GATEWAY_API_KEY`: your Vercel AI Gateway API key
- `AI_GATEWAY_MODEL`: a currently available model ID from the AI Gateway model catalog

After adding both variables, redeploy. Do not paste secrets into GitHub or chat. AI output is a draft only and must be checked against the physical product and Flipkart's category requirements.
