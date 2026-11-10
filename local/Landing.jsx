import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./site/site.css";
import "./site/sections.css";
import "./site/attio.css";
import { SiteHeader, SiteFooter } from "./site/chrome";
import { CustomersPage, HomePage, PlatformPage, PricingPage, ProductPage, ResourcesPage } from "./site/pages";
import FeaturePage from "./site/feature-page";
import { FEATURES } from "./site/features";
import { CursorLayer } from "./site/cursors";
import { LegalPage, LEGAL_PAGES } from "./site/legal";
import "./site/legal.css";

const CURRENT_PAGE = document.body?.dataset?.page || "home";

const PAGES = {
  home: HomePage,
  platform: PlatformPage,
  product: ProductPage,
  resources: ResourcesPage,
  customers: CustomersPage,
  pricing: PricingPage,
};

const feature = FEATURES[CURRENT_PAGE];
const legal = LEGAL_PAGES[CURRENT_PAGE];
const Page = PAGES[CURRENT_PAGE] || HomePage;

const TITLES = {
  home: "Linear CRM · Customer relationships, in flow",
  platform: "Platform · Linear CRM",
  product: "Product tour · Linear CRM",
  resources: "Resources · Linear CRM",
  customers: "Use cases · Linear CRM",
  pricing: "Pricing · Linear CRM",
};

function App() {
  return (
    <div className="lp-site">
      <a className="lp-skip" href="#main">Skip to content</a>
      <SiteHeader page={CURRENT_PAGE} />
      <main id="main">
        {feature ? <FeaturePage data={feature} /> : legal ? <LegalPage page={CURRENT_PAGE} /> : <Page />}
      </main>
      <SiteFooter />
      <CursorLayer />
    </div>
  );
}

if (feature?.seo) {
  document.title = `${feature.seo.title} · Linear CRM`;
} else if (legal) {
  document.title = legal.seo.title;
} else if (TITLES[CURRENT_PAGE]) {
  document.title = TITLES[CURRENT_PAGE];
}

createRoot(document.getElementById("root")).render(<App />);
