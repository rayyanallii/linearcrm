# Linear CRM landing redesign

Goal: present the existing portfolio CRM through readable product examples and a concise narrative inspired by Attio's spacious editorial layout.

Architecture: preserve the CRM and marketing routes. Replace the homepage with an isolated React component and scoped stylesheet. Keep shared navigation and supporting-page functionality. Use existing Framer Motion for viewport reveals and tab transitions; respect reduced motion.

Stack: React, Framer Motion, CSS, esbuild, Playwright.

Design: white canvas, ink #202124, secondary #646b77, blue #365ef4. Inter, 88px desktop hero, 54px section headings, 20px introductory copy, 16px product text, 13px minimum metadata. Mobile hero 46px, section headings 36px. Thin borders, modest corner radii, no floating decorative cards or miniature full-app screenshot.

Page map:
- Home: proposition → interactive relationship table → pipeline → Liner sample → FAQ → open CRM.
- Platform: revenue lifecycle and linked records.
- Product: views, fields, tasks and customization.
- Resources: running locally, imports and backups.
- Customers (navigation: Use cases): illustrative business scenarios, never claimed customers.
- Pricing: free portfolio project and optional service costs.

Layout:
```
navigation / announcement
        large headline
        explanation + CTA
   readable company table | selected contact
section heading          | pipeline board
dark Liner introduction  | sample conversation
FAQ rows
closing invitation / footer
```

Constraints: browser-only CRM; preserve stored data; no invented testimonials, integrations, or usage claims. Sample conversations clearly labeled. No extra packages needed; Watermelon tabs reviewed, but importing their Tailwind implementation would add unnecessary dependencies.

Review focus: readable UI without scaling, mobile overflow, working table selection/tabs/chat examples, real CTA links, reduced-motion behavior, all existing marketing routes.

## Implementation
- [x] Add `local/MarketingHome.jsx` with meaningful interactive demonstrations.
- [x] Add `local/marketing-editorial.css` with responsive typography and shared-page sizing.
- [x] Integrate the new homepage in `local/Landing.jsx`; rename Customers navigation to Use cases.
- [x] Update landing regression checks for the new experience and verify all routes.
- [x] Build and inspect desktop/mobile screenshots; record results.

Validation: production build passed. Playwright checked company search/selection, contact tabs, forecast switching, sample assistant responses, FAQ expansion, mobile navigation, reduced-motion visibility, and all six marketing routes. No page errors or horizontal overflow at the tested sizes (home: 390, 768, 1440; supporting pages: 390, 1440). Desktop/mobile screenshots inspected in `screenshots/editorial-*.png`.

Implementation ruling: retain the five existing supporting routes and their functional demos, applying a shared typography pass. The homepage is rebuilt rather than adding another round of miniature overlays. Watermelon source was not imported; existing Framer Motion handles the required interactions and scroll reveals.
