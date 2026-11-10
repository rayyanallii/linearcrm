import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronDown, IconChevronRight, IconMenu2, IconX, IconArrowUpRight, IconArrowRight } from "@tabler/icons-react";
import { Logo, LogoMark } from "./logo";
import { Button } from "./ui";
import { NAV_LINKS, PLATFORM_MENU, ROUTES, FOOTER_GROUPS, LEGAL_LINKS } from "./navigation";

function isActive(page, target) {
  if (target === "platform") return page === "platform" || page.startsWith("platform-");
  if (target === "product") return page === "product" || page.startsWith("product-");
  if (target === "resources") return page === "resources" || page.startsWith("resources-");
  return page === target;
}

function MegaMenu({ onClose }) {
  return (
    <motion.div
      className="lp-mega"
      id="platform-menu"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      <div className="lp-mega-grid">
        {PLATFORM_MENU.map((column) => (
          <section className="lp-mega-column" key={column.title}>
            <span>{column.title}</span>
            {column.items.map((item) => (
              <a href={item.href} onClick={onClose} key={item.title}>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </a>
            ))}
          </section>
        ))}
      </div>
      <aside className="lp-mega-aside">
        <div>
          <span>Platform overview</span>
          <p>The five motions that share one record graph.</p>
        </div>
        <a href={ROUTES.platform} onClick={onClose}>See the whole system <IconArrowRight size={13} /></a>
        <a href={ROUTES.crm} onClick={onClose}>Open the workspace <IconArrowUpRight size={13} /></a>
      </aside>
    </motion.div>
  );
}

export function SiteHeader({ page }) {
  const [announcement, setAnnouncement] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(false);
        setMobileOpen(false);
      }
    };
    const onPointerDown = (event) => {
      if (openMenu && headerRef.current && !headerRef.current.contains(event.target)) setOpenMenu(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openMenu]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeAll = () => {
    setOpenMenu(false);
    setMobileOpen(false);
  };

  return (
    <>
      {announcement && (
        <div className="lp-announce">
          <a href={ROUTES.liner}>
            <span className="lp-announce-dot" aria-hidden="true" />
            Liner answers questions about the records you already have
            <IconArrowRight size={13} />
          </a>
          <button type="button" aria-label="Dismiss announcement" onClick={() => setAnnouncement(false)}>
            <IconX size={14} />
          </button>
        </div>
      )}

      <header ref={headerRef} className={`lp-head ${scrolled ? "is-scrolled" : ""}`} onMouseLeave={() => setOpenMenu(false)}>
        <div className="lp-nav">
          <a className="lp-brand" href={ROUTES.home} aria-label="Linear CRM home">
            <Logo height={19} />
          </a>

          <nav className="lp-nav-links" aria-label="Main navigation">
            {NAV_LINKS.map((link) =>
              link.menu ? (
                <a
                  key={link.label}
                  href={link.href}
                  className={`lp-nav-link ${isActive(page, link.page) ? "is-active" : ""} ${openMenu ? "is-open" : ""}`.trim()}
                  aria-current={isActive(page, link.page) ? "page" : undefined}
                  aria-haspopup="true"
                  aria-expanded={openMenu}
                  aria-controls="platform-menu"
                  onMouseEnter={() => setOpenMenu(true)}
                  onFocus={() => setOpenMenu(true)}
                  onClick={() => setOpenMenu(false)}
                >
                  {link.label}
                  <IconChevronDown size={12} stroke={2} />
                </a>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className={`lp-nav-link ${isActive(page, link.page) ? "is-active" : ""}`.trim()}
                  aria-current={isActive(page, link.page) ? "page" : undefined}
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>

          <div className="lp-nav-actions">
            <a className="lp-nav-quiet" href={ROUTES.localFirst}>How it runs</a>
            <Button href={ROUTES.crm} size="sm" icon="up">Open the workspace</Button>
            <button
              className="lp-mobile-toggle"
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? <IconX size={19} /> : <IconMenu2 size={19} />}
            </button>
          </div>
        </div>

        <AnimatePresence>{openMenu && <MegaMenu onClose={closeAll} />}</AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-navigation"
              className="lp-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="lp-mobile-inner">
                {NAV_LINKS.filter((link) => !link.menu).map((link) => (
                  <a href={link.href} key={link.label} onClick={closeAll}>
                    {link.label}
                    <IconChevronRight size={15} />
                  </a>
                ))}
                <span className="lp-mobile-group">Platform</span>
                {PLATFORM_MENU.flatMap((column) => column.items).map((item) => (
                  <a className="lp-mobile-sub" href={item.href} key={item.title} onClick={closeAll}>
                    {item.title}
                    <IconChevronRight size={14} />
                  </a>
                ))}
                <Button href={ROUTES.crm} className="lp-mobile-cta" icon="up" onClick={closeAll}>Open the workspace</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-main">
        <div className="lp-footer-brand">
          <Logo tone="white" height={21} />
          <p>A local-first CRM for founders, studios and small teams. No account, no server copy of your workspace.</p>
          <span className="lp-footer-status"><i /> Personal project · runs in your browser</span>
        </div>
        {FOOTER_GROUPS.map((group) => (
          <div className="lp-footer-column" key={group.title}>
            <strong>{group.title}</strong>
            {group.links.map((link) => <a href={link.href} key={link.label}>{link.label}</a>)}
          </div>
        ))}
      </div>
      <div className="lp-footer-bottom">
        <span>© 2026 Linear CRM</span>
        <span>Built with Twenty UI · AGPL-3.0</span>
        <nav className="lp-footer-legal" aria-label="Legal">
          {LEGAL_LINKS.map((link) => <a href={link.href} key={link.href}>{link.short}</a>)}
        </nav>
        <span className="lp-footer-mark"><LogoMark tone="white" size={14} /> Customer relationships, in flow.</span>
      </div>
    </footer>
  );
}
