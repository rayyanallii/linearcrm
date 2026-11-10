import React from "react";
import { IconArrowRight, IconArrowUpRight, IconCheck } from "@tabler/icons-react";

export function Kicker({ children, tone = "ink", className = "" }) {
  return <span className={`lp-kicker lp-kicker--${tone} ${className}`.trim()}>{children}</span>;
}

export function Button({ href, children, variant = "primary", size = "md", icon, className = "", ...rest }) {
  const classes = `lp-btn lp-btn--${variant} lp-btn--${size} ${className}`.trim();
  const endIcon =
    icon === "up" ? <IconArrowUpRight size={14} stroke={1.8} /> :
    icon === "right" ? <IconArrowRight size={14} stroke={1.8} /> :
    null;
  const inner = (
    <>
      <span>{children}</span>
      {endIcon}
    </>
  );
  if (href) {
    return <a className={classes} href={href} {...rest}>{inner}</a>;
  }
  return <button className={classes} type="button" {...rest}>{inner}</button>;
}

export function TextLink({ href, children, tone = "ink", className = "", ...rest }) {
  return (
    <a className={`lp-text-link lp-text-link--${tone} ${className}`.trim()} href={href} {...rest}>
      {children}
      <IconArrowRight size={14} stroke={1.8} />
    </a>
  );
}

const TAG_TONES = {
  neutral: "neutral",
  blue: "blue",
  green: "green",
  amber: "amber",
  red: "red",
  purple: "purple",
  teal: "teal",
  dark: "dark",
};

export function Tag({ tone = "neutral", children, className = "" }) {
  return <span className={`lp-tag lp-tag--${TAG_TONES[tone] || "neutral"} ${className}`.trim()}>{children}</span>;
}

export function Avatar({ initials, tone = "slate", size = "md", className = "" }) {
  return (
    <span className={`lp-avatar lp-avatar--${tone} lp-avatar--${size} ${className}`.trim()} aria-hidden="true">
      {initials}
    </span>
  );
}

export function CheckList({ items, tone = "ink" }) {
  return (
    <ul className={`lp-checks lp-checks--${tone}`}>
      {items.map((item) => (
        <li key={item}>
          <span className="lp-checks-box"><IconCheck size={11} stroke={2.4} /></span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function SectionHead({ kicker, title, copy, align = "left", children, className = "" }) {
  return (
    <header className={`lp-section-head lp-section-head--${align} ${className}`.trim()}>
      <div>
        {kicker && <Kicker>{kicker}</Kicker>}
        <h2>{title}</h2>
      </div>
      {copy && <p>{copy}</p>}
      {children}
    </header>
  );
}

export function PageHero({ kicker, title, accent, copy, primary, secondary, note, children }) {
  return (
    <section className="lp-page-hero">
      <div className="lp-page-hero-glow" aria-hidden="true" />
      <div className="lp-page-hero-copy">
        {kicker && <Kicker>{kicker}</Kicker>}
        <h1>{title}{accent && <span>{accent}</span>}</h1>
        <p>{copy}</p>
        <div className="lp-actions">
          {primary && <Button href={primary.href} icon="up">{primary.label}</Button>}
          {secondary && <Button href={secondary.href} variant="secondary" icon="right">{secondary.label}</Button>}
        </div>
        {note && <span className="lp-page-note">{note}</span>}
      </div>
      {children && <div className="lp-page-hero-visual">{children}</div>}
    </section>
  );
}

export function FeatureBlock({ id, kicker, title, copy, points = [], demo, reverse = false, wide = false, footnote }) {
  return (
    <section
      id={id}
      className={`lp-feature ${reverse ? "lp-feature--reverse" : ""} ${wide ? "lp-feature--wide" : ""}`.trim()}
    >
      <div className="lp-feature-copy">
        {kicker && <Kicker>{kicker}</Kicker>}
        <h2>{title}</h2>
        <p>{copy}</p>
        {points.length > 0 && <CheckList items={points} />}
        {footnote && <span className="lp-feature-note">{footnote}</span>}
      </div>
      <div className="lp-feature-stage">{demo}</div>
    </section>
  );
}

export function DemoShell({ title, subtitle, actions, footer, children, className = "" }) {
  return (
    <div className={`d-shell ${className}`.trim()}>
      {(title || actions) && (
        <div className="d-shell-head">
          <div className="d-shell-title">
            {title && <strong>{title}</strong>}
            {subtitle && <small>{subtitle}</small>}
          </div>
          {actions && <div className="d-shell-actions">{actions}</div>}
        </div>
      )}
      <div className="d-shell-body">{children}</div>
      {footer && <div className="d-shell-foot">{footer}</div>}
    </div>
  );
}

export function Tabs({ items, value, onChange, label, className = "" }) {
  return (
    <div className={`d-tabs ${className}`.trim()} role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={value === item.key}
          className={value === item.key ? "active" : ""}
          onClick={() => onChange(item.key)}
        >
          {item.label}
          {item.count != null && <span>{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function PageCta({
  kicker = "Open the workspace",
  title = "See it with your own records.",
  copy = "The sample workspace is already loaded. No account, no server, no setup.",
}) {
  return (
    <section className="lp-cta">
      <div className="lp-cta-rings" aria-hidden="true" />
      <Kicker tone="dark">{kicker}</Kicker>
      <h2>{title}</h2>
      <p>{copy}</p>
      <div className="lp-actions">
        <Button href="./app.html" variant="light" icon="up">Open the workspace</Button>
        <Button href="./resources-local-first.html" variant="ghost" icon="right">How it runs</Button>
      </div>
    </section>
  );
}

export function RelatedLinks({ items }) {
  return (
    <section className="lp-related">
      <Kicker>Keep reading</Kicker>
      <div className="lp-related-grid">
        {items.map((item) => (
          <a href={item.href} key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.copy}</span>
            <IconArrowRight size={15} stroke={1.8} />
          </a>
        ))}
      </div>
    </section>
  );
}
