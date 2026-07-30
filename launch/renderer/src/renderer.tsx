import { DemoApp } from "./demo-apps";
import { GalleryAsset } from "./gallery";
import { BrandFonts } from "./shared";
import { ProductHuntThumbnail, ThumbnailContactSheet } from "./thumbnail";

function RendererIndex() {
  return (
    <main className="renderer-index" data-render-ready="true">
      <h1>Squid launch renderer</h1>
      <p>Use the deterministic routes below.</p>
      <ul>
        <li>/launch-render/thumbnail</li>
        <li>/launch-render/gallery/1 through /launch-render/gallery/8</li>
        <li>/launch-render/demo/fieldflow</li>
        <li>/launch-render/demo/launchops</li>
      </ul>
    </main>
  );
}

export function LaunchRenderer() {
  const path = window.location.pathname.replace(/\/$/, "");
  const frame = Number(
    new URLSearchParams(window.location.search).get("frame") ?? "0",
  );
  const galleryMatch = path.match(/\/launch-render\/gallery\/(\d+)$/);
  const demoMatch = path.match(/\/launch-render\/demo\/(fieldflow|launchops)$/);

  let content;
  if (path === "/launch-render/thumbnail") {
    content = (
      <ProductHuntThumbnail frame={Number.isFinite(frame) ? frame : 0} />
    );
  } else if (path === "/launch-render/contact/thumbnail") {
    content = <ThumbnailContactSheet />;
  } else if (galleryMatch) {
    content = <GalleryAsset index={Number(galleryMatch[1])} />;
  } else if (demoMatch) {
    content = (
      <DemoApp
        name={demoMatch[1] as "fieldflow" | "launchops"}
        updated={
          new URLSearchParams(window.location.search).get("state") === "updated"
        }
      />
    );
  } else {
    content = <RendererIndex />;
  }

  return (
    <>
      <BrandFonts />
      {content}
    </>
  );
}
