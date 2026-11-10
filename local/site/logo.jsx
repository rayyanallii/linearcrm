const ASSETS = {
  mark: "./public/brand/linear-mark.png",
  markWhite: "./public/brand/linear-mark-white.png",
  wordmark: "./public/brand/linear-wordmark.png",
  wordmarkWhite: "./public/brand/linear-wordmark-white.png",
};

const MARK_RATIO = 309 / 512;
const WORD_RATIO = 1000 / 204;

export function LogoMark({ tone = "ink", size = 22, className = "" }) {
  return (
    <img
      className={`lp-logo-mark ${className}`.trim()}
      src={tone === "white" ? ASSETS.markWhite : ASSETS.mark}
      alt=""
      width={size}
      height={Math.round(size * MARK_RATIO)}
      style={{ width: `${size}px`, height: `${Math.round(size * MARK_RATIO)}px` }}
      aria-hidden="true"
    />
  );
}

export function Logo({ tone = "ink", height = 19, className = "", label = "Linear CRM" }) {
  return (
    <img
      className={`lp-logo ${className}`.trim()}
      src={tone === "white" ? ASSETS.wordmarkWhite : ASSETS.wordmark}
      alt={label}
      height={height}
      width={Math.round(height * WORD_RATIO)}
      style={{ width: `${Math.round(height * WORD_RATIO)}px`, height: `${height}px` }}
    />
  );
}
