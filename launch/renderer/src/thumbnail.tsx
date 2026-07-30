import { ProgressionIcon, SquidLogo } from "./shared";

const progression = ["prompt", "plan", "app", "verified", "export"] as const;

export function ProductHuntThumbnail({ frame = 0 }: { frame?: number }) {
  const activeIndex = Math.floor(frame / 6) % progression.length;
  return (
    <main
      className="product-hunt-thumbnail"
      data-render-ready="true"
      aria-label="Squid Agent Product Hunt thumbnail"
    >
      <div className="thumbnail-orbit" aria-hidden="true" />
      {progression.map((kind, index) => {
        const angle = -90 + index * 72;
        const radians = (angle * Math.PI) / 180;
        const radius = 88;
        return (
          <ProgressionIcon
            key={kind}
            kind={kind}
            active={index === activeIndex}
            style={{
              left: 120 + Math.cos(radians) * radius,
              top: 120 + Math.sin(radians) * radius,
            }}
          />
        );
      })}
      <div className="thumbnail-logo-shell">
        <SquidLogo className="thumbnail-logo" />
      </div>
    </main>
  );
}

export function ThumbnailContactSheet() {
  const sizes = [240, 120, 60, 32];
  return (
    <main className="thumbnail-contact-sheet" data-render-ready="true">
      <header>
        <strong>Squid Product Hunt thumbnail</strong>
        <span>Recognition test at delivered sizes</span>
      </header>
      <div className="thumbnail-size-grid">
        {sizes.map((size) => (
          <figure key={size}>
            <div
              className="thumbnail-scale-box"
              style={{ width: size, height: size }}
            >
              <div
                style={{
                  transform: `scale(${size / 240})`,
                  transformOrigin: "top left",
                }}
              >
                <ProductHuntThumbnail frame={0} />
              </div>
            </div>
            <figcaption>
              {size} × {size}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
