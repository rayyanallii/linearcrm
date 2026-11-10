import React from "react";
import { Kicker } from "./ui";
import { LEGAL_LINKS, ROUTES } from "./navigation";

const UPDATED = "11 November 2026";
const PROJECT_NOTICE = "A personal project for evaluation only. Not a commercial product and not intended for production use. Independent of Linear.";

export const LEGAL_PAGES = {
  privacy: {
    kicker: "Legal",
    title: "Privacy policy",
    intro: "How a browser-only sample workspace handles the records you create, the limited data that can leave the browser, and the choices you keep.",
    seo: {
      title: "Privacy policy — Linear CRM",
      description: "A detailed privacy policy for the Linear CRM personal project: local browser records, optional AI requests, hosting logs, retention, and your choices.",
    },
    sections: [
      {
        title: "Scope",
        paragraphs: [
          "This policy covers the marketing pages and the sample CRM workspace served from this project. There are no user accounts, no login, and no application backend that receives your records.",
          "Because the project is operated as a static site, most privacy decisions happen in your browser. The sections below separate the records you create from the technical data a web host necessarily sees.",
        ],
      },
      {
        title: "Records you create",
        paragraphs: [
          "The sample workspace contains companies, people, leads, opportunities, tasks, notes, saved views, and workflow settings. Anything you add or edit is stored locally so it survives a page reload.",
        ],
        table: {
          head: ["Data", "Where it is kept", "Why", "How long"],
          rows: [
            ["Companies, people, leads, opportunities", "Browser local storage", "The sample CRM and your edits", "Until you clear this site's data"],
            ["Notes, tasks, links and timeline activity", "Browser local storage", "Follow-up context on a record", "Until you clear this site's data"],
            ["Saved views, fields, workflows, settings", "Browser local storage", "Workspace behaviour and layout", "Until you clear this site's data"],
            ["A JSON backup", "A file you download", "Portability and restore", "Under your control"],
            ["Optional Liner connection key", "Browser session storage", "Authenticate a provider for the open tab", "Until the tab or session ends"],
          ],
        },
      },
      {
        title: "Technical data from hosting",
        paragraphs: [
          "The static host that serves these files may record standard request information such as an IP address, user agent, requested URL, and timestamp in its own logs. That processing is governed by the host's policy rather than by this project.",
          "This project does not add analytics scripts, advertising pixels, session recording, fingerprinting, or cross-site identity code. Fonts and brand images are served from this site rather than a third-party font or image network.",
        ],
      },
      {
        title: "The optional Liner connection",
        paragraphs: [
          "Liner's basic summaries are computed from records already in the browser and require no external model. If you configure a connection key, the prompt you enter and the workspace context needed to answer it are sent from your browser directly to the provider you selected.",
          "The project does not operate a proxy server and does not receive a copy of that request. The provider may retain prompts, outputs, and request metadata under its own terms. Do not connect a provider or submit content that you are not prepared to send to that company.",
          "The connection key is written to session storage, not to a CRM backup. Removing it or closing the tab ends the browser-side session, although a build-time key supplied by the site operator would still apply if one is configured.",
        ],
      },
      {
        title: "Cookies and tracking",
        paragraphs: [
          "This project does not set analytics, advertising, or cross-site tracking cookies. The banner-free experience reflects that choice rather than a hidden consent flow.",
          "The separate cookie statement lists the browser storage keys, their lifetimes, and the limited circumstances in which an external AI provider or host may use its own technologies.",
        ],
      },
      {
        title: "Security and storage limits",
        paragraphs: [
          "Browser local storage is not encrypted by this project. Anyone with access to your browser profile, an extension with permission to read site data, or your unlocked device may be able to read the workspace.",
          "There is no application-level access control, audit trail, encryption key, or recovery service. Treat the workspace as a local demonstration, keep independent copies of anything important, and avoid entering credentials or sensitive personal data.",
        ],
      },
      {
        title: "Retention and deletion",
        paragraphs: [
          "Records remain in your browser until you clear this site's data, delete a workspace inside the app, or remove the browser profile. A private window discards the workspace when the session ends.",
          "There is no server-side copy for the project owner to delete. Backups are ordinary files that you create and must manage yourself; deleting site data does not delete a backup you already downloaded.",
        ],
      },
      {
        title: "Your choices",
        bullets: [
          "Use the workspace without connecting any external model.",
          "Export a JSON backup before clearing browser data or moving to another browser.",
          "Clear site data to remove local records; use a private window for a disposable session.",
          "Review and remove the Liner session key when you no longer need the connection.",
        ],
      },
      {
        title: "Children and changes",
        paragraphs: [
          "The project is not directed at children and does not knowingly collect personal information from them. There are no accounts or age-gated features.",
          "This policy may be revised as the project changes. The review date above is the authoritative version date. Because this is a personal project, there is no data-protection officer, support desk, or guaranteed response channel for access or deletion requests.",
        ],
      },
    ],
  },
  terms: {
    kicker: "Legal",
    title: "Terms and conditions",
    intro: "The rules for using this evaluation project, the limits of the sample workspace, and the responsibilities that stay with you.",
    seo: {
      title: "Terms and conditions — Linear CRM",
      description: "Detailed terms for the Linear CRM personal project: evaluation licence, acceptable use, data responsibility, third-party AI, warranties, and liability.",
    },
    sections: [
      {
        title: "Acceptance",
        paragraphs: [
          "By opening the site or using the sample workspace, you agree to these terms. If you do not agree, do not use the project.",
          "These terms apply to the marketing pages and the browser-based CRM demo. They do not create an account, employment, agency, partnership, or customer relationship.",
        ],
      },
      {
        title: "Evaluation licence",
        paragraphs: [
          "You may use the hosted pages and the sample workspace for personal evaluation, learning, and experimentation. This permission is limited, revocable, and non-exclusive.",
          "No rights are granted to the Linear name or marks, third-party icons, fonts, or other assets except as they appear in the project for that evaluation. Do not present the project as an official Linear product or as your own commercial offering.",
        ],
      },
      {
        title: "Not for production use",
        paragraphs: [
          "The project is not a production CRM and is not designed for business-critical, regulated, financial, legal, medical, or safety-related records. Use disposable sample data rather than real customer data.",
          "There is no uptime commitment, backup service, disaster recovery, access control, audit logging, or support agreement. Features may be incomplete, change without notice, or stop working.",
        ],
      },
      {
        title: "Your data and backups",
        paragraphs: [
          "You are responsible for the data you enter, the device and browser profile you use, and any backup you create. Browser storage can be cleared by the browser, a privacy setting, an extension, a profile change, or the user.",
          "The project owner cannot recover a lost workspace because no server-side copy is kept. Review the privacy policy for the storage model and the cookie statement for the exact browser keys.",
        ],
      },
      {
        title: "Acceptable use",
        bullets: [
          "Do not use the project for unlawful, harmful, or deceptive activity.",
          "Do not attempt to bypass security, disrupt the static host, or interfere with other users.",
          "Do not enter credentials, regulated personal data, confidential business information, or content you lack permission to process.",
          "Do not represent the demo, its sample records, or its forecasts as real business advice.",
        ],
      },
      {
        title: "Optional third-party services",
        paragraphs: [
          "If you connect an external AI provider, you are using a separate service under that provider's terms, privacy policy, availability, and pricing. The project does not control the provider, does not guarantee its output, and is not responsible for its retention or use of the request.",
          "You are responsible for choosing an appropriate provider and for deciding what context is safe to send.",
        ],
      },
      {
        title: "Availability and changes",
        paragraphs: [
          "The project may be modified, interrupted, or removed at any time without notice. No maintenance window, deprecation period, or migration path is guaranteed.",
          "These terms and the legal pages may be updated. Continued use after a change means you accept the revised terms.",
        ],
      },
      {
        title: "Intellectual property and independence",
        paragraphs: [
          "Linear and its marks belong to their respective owner. This is an independent project and is not affiliated with, endorsed by, sponsored by, or approved by Linear.",
          "The project's original copy and layout are provided for the evaluation described above. Third-party components remain subject to their own licences and notices.",
        ],
      },
      {
        title: "Disclaimer of warranties",
        paragraphs: [
          "The project is provided as-is and as-available, without warranties of any kind, whether express, implied, or statutory, including merchantability, fitness for a particular purpose, title, non-infringement, accuracy, and uninterrupted operation.",
          "Some jurisdictions do not allow certain warranty exclusions, so part of this section may not apply to you.",
        ],
      },
      {
        title: "Limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, the project owner is not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost records, lost opportunity, or business interruption arising from the project.",
          "Where liability cannot be excluded, it is limited to the amount you paid to use the project, which is zero. Nothing here excludes liability that cannot lawfully be excluded.",
        ],
      },
      {
        title: "Severability and entire agreement",
        paragraphs: [
          "If a provision is found unenforceable, the remaining provisions continue in effect. These terms and the linked legal pages form the entire agreement for use of the project.",
        ],
      },
    ],
  },
  accessibility: {
    kicker: "Legal",
    title: "Accessibility statement",
    intro: "The accessibility measures in place, the parts that still need work, and the limits of what has actually been tested.",
    seo: {
      title: "Accessibility statement — Linear CRM",
      description: "A detailed accessibility statement for the Linear CRM personal project: measures, testing, known limitations, compatibility, feedback, and review.",
    },
    sections: [
      {
        title: "Scope and conformance status",
        paragraphs: [
          "This statement covers the marketing pages, the sample CRM workspace, and the legal pages. The project has not completed a formal accessibility audit and does not claim full conformance with WCAG 2.2 AA or another standard.",
          "The working target is the spirit of WCAG 2.2 AA: semantic structure, keyboard operation, readable contrast, visible focus, and layouts that reflow on narrow screens. The project is not certified, audited, or supported as an accessible production service.",
        ],
      },
      {
        title: "Measures implemented",
        bullets: [
          "Semantic landmarks, a single main heading per page, descriptive link text, and native buttons for interactive controls.",
          "A skip-to-content link and visible keyboard focus styles on links, buttons, inputs, and disclosure controls.",
          "Keyboard-operable platform navigation, dropdown menus, accordions, and demo controls where they are exposed as native controls.",
          "Responsive layouts that avoid page-level horizontal scrolling at 390px and 768px in the tested views.",
          "Decorative brand marks use empty alternative text, with adjacent text carrying the page meaning.",
          "The mobile navigation has a labelled open and close control and a visible focus state.",
        ],
      },
      {
        title: "Testing performed",
        paragraphs: [
          "Checks have been manual: keyboard tab order, Escape and focus behaviour in menus, narrow viewport reflow, heading structure, link visibility, and browser console errors in current Chrome.",
          "No screen-reader, switch-access, voice-control, magnification, forced-colors, or formal WCAG audit has been completed. Passing the manual checks above is not evidence of general conformance.",
        ],
      },
      {
        title: "Known limitations",
        paragraphs: [
          "The interactive demos are dense visual simulations. Some state changes, charts, and sample tables are not announced to assistive technology, and the sample data is illustrative rather than a complete accessible data grid.",
          "The marketing site adds a decorative cursor layer on wide pointer-based screens. It is not required to operate the site, but it can obscure the native pointer and may be distracting. It is hidden at widths below 640px, and there is currently no explicit off switch.",
          "Some controls rely on visual iconography. Their accessible names are present where implemented, but the visual-only demos are not a substitute for a fully accessible product.",
        ],
      },
      {
        title: "Compatibility",
        paragraphs: [
          "The project targets current versions of Chrome, Firefox, Safari, and Edge. It depends on JavaScript for the CRM demos and on modern CSS for layout. Older browsers, blocked JavaScript, or aggressive content blocking may remove functionality.",
          "There is no supported browser matrix, polyfill commitment, or assistive-technology compatibility list.",
        ],
      },
      {
        title: "Feedback and response",
        paragraphs: [
          "This is a personal project without a support desk, accessibility coordinator, or response-time commitment. Reports may not receive a reply, and there is no formal remediation timeline.",
          "If a page is difficult to use, the static legal pages remain readable without the interactive demos, and the sample workspace should not be relied on for a time-sensitive task.",
        ],
      },
      {
        title: "Assessment and updates",
        paragraphs: [
          "This statement was reviewed on " + UPDATED + ". It will be revised when the interface changes, when a meaningful accessibility review is completed, or when a known limitation is fixed.",
        ],
      },
    ],
  },
  cookies: {
    kicker: "Legal",
    title: "Cookie statement",
    intro: "A precise inventory of the cookies and browser storage this project uses, including the optional AI connection and the third-party boundaries.",
    seo: {
      title: "Cookie statement — Linear CRM",
      description: "A detailed cookie and browser-storage statement for Linear CRM: no tracking cookies, local-storage keys, session AI key, third parties, and controls.",
    },
    sections: [
      {
        title: "Scope",
        paragraphs: [
          "This statement covers cookies and similar browser storage used by the marketing pages, sample workspace, and legal pages. It complements the privacy policy rather than repeating its full data inventory.",
        ],
      },
      {
        title: "First-party cookies",
        paragraphs: [
          "This project does not set first-party analytics, advertising, preference, or session cookies. There is no cookie consent banner because there are no non-essential cookies to enable.",
        ],
      },
      {
        title: "Local storage inventory",
        paragraphs: [
          "The workspace uses localStorage, which is not a cookie and is not sent with every HTTP request. The keys below are created only when the corresponding feature is used.",
        ],
        table: {
          head: ["Key", "Purpose", "Lifetime"],
          rows: [
            ["linear-crm.v1", "Default workspace records, views, settings and sample data", "Until site data is cleared"],
            ["linear-crm.workspaces.v1", "Registry of additional workspaces and the active workspace", "Until site data is cleared"],
            ["linear-crm.ws.<id>", "Data for an additional named workspace", "Until that workspace or site data is deleted"],
          ],
        },
      },
      {
        title: "Session storage",
        paragraphs: [
          "An optional Liner connection key is stored under linear-crm.liner-session-key in sessionStorage. It is scoped to the open tab and is not included in a workspace export or backup.",
          "Closing the tab or removing the key ends that browser-side session. A build-configured key supplied by the site operator, if present, is separate from this user-entered key.",
        ],
      },
      {
        title: "Third-party requests",
        paragraphs: [
          "There are no embedded advertising, analytics, social-media, or session-replay scripts. The static host may set infrastructure cookies or log requests under its own policy.",
          "If you configure an external AI provider, your browser contacts that provider directly. The provider may set its own cookies or retain request data under its terms. This project does not receive or control that provider-side storage.",
        ],
      },
      {
        title: "Do Not Track and Global Privacy Control",
        paragraphs: [
          "Because the project does not track users across sites or run analytics, there is no separate opt-out state to apply for Do Not Track or Global Privacy Control signals. The absence of tracking is the default.",
        ],
      },
      {
        title: "Managing and clearing storage",
        bullets: [
          "Use the browser's site-data settings to remove local and session storage for this domain.",
          "Use a private window for a temporary workspace that does not persist after the session.",
          "Export a JSON backup before clearing data if you want to restore records later.",
          "Remove the Liner session key from the connection screen or close the tab to end the optional AI session.",
        ],
      },
      {
        title: "Changes",
        paragraphs: [
          "This statement was reviewed on " + UPDATED + ". It will be updated if the storage keys, third-party connections, or host-level behaviour change.",
        ],
      },
    ],
  },
};

export function LegalPage({ page }) {
  const data = LEGAL_PAGES[page];
  if (!data) return null;

  return (
    <div className="lp-legal">
      <header className="lp-legal-hero">
        <Kicker>{data.kicker}</Kicker>
        <h1>{data.title}</h1>
        <p>{data.intro}</p>
        <span className="lp-legal-updated">Last updated {UPDATED}</span>
      </header>

      <div className="lp-legal-disclaimer" role="note">
        <strong>Evaluation only</strong>
        <p>{PROJECT_NOTICE}</p>
      </div>

      <div className="lp-legal-layout">
        <aside className="lp-legal-aside">
          <span className="lp-legal-aside-label">Legal</span>
          {LEGAL_LINKS.map((link) => (
            <a
              href={link.href}
              aria-current={link.label === data.title ? "page" : undefined}
              key={link.href}
            >
              {link.label}
            </a>
          ))}
        </aside>

        <article className="lp-legal-body">
          {data.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.table && (
                <div className="lp-legal-table-wrap" tabIndex={0} role="region" aria-label={`${section.title} table`}>
                  <table>
                    <thead>
                      <tr>{section.table.head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")}>
                          {row.map((cell, index) => (
                            <td key={cell} data-label={section.table.head[index]}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.bullets && (
                <ul>
                  {section.bullets.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
          <a className="lp-legal-back" href={ROUTES.home}>Back to Linear CRM</a>
        </article>
      </div>
    </div>
  );
}
