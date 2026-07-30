import {
  CinderStudioApp,
  type CinderView,
} from "../../demo-projects/cinder-studio/CinderStudioApp";
import {
  FieldFlowApp,
  type FieldFlowView,
} from "../../demo-projects/fieldflow/FieldFlowApp";
import {
  LaunchOpsApp,
  type LaunchOpsView,
} from "../../demo-projects/launchops/LaunchOpsApp";
import { GalleryAsset } from "./gallery";
import { LaunchGifDemo, type LaunchGifName } from "./gif-demos";
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
        <li>/launch-demo/fieldflow</li>
        <li>/launch-demo/launchops</li>
        <li>/launch-demo/cinder-studio</li>
        <li>/launch-render/gif/plan-mode</li>
        <li>/launch-render/gif/screenshot-to-app</li>
        <li>/launch-render/gif/verify-and-export</li>
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
  const legacyDemoMatch = path.match(
    /\/launch-render\/demo\/(fieldflow|launchops)$/,
  );
  const gifMatch = path.match(
    /\/launch-render\/gif\/(plan-mode|screenshot-to-app|verify-and-export)$/,
  );

  let content;
  if (gifMatch) {
    content = <LaunchGifDemo name={gifMatch[1] as LaunchGifName} />;
  } else if (path === "/launch-render/thumbnail") {
    content = (
      <ProductHuntThumbnail frame={Number.isFinite(frame) ? frame : 0} />
    );
  } else if (path === "/launch-render/contact/thumbnail") {
    content = <ThumbnailContactSheet />;
  } else if (galleryMatch) {
    content = <GalleryAsset index={Number(galleryMatch[1])} />;
  } else if (path.startsWith("/launch-demo/fieldflow")) {
    const view: FieldFlowView = path.endsWith("/quote")
      ? "quote"
      : path.endsWith("/dashboard")
        ? "dashboard"
        : path.endsWith("/customer")
          ? "customer"
          : "home";
    content = <FieldFlowApp view={view} />;
  } else if (path.startsWith("/launch-demo/launchops")) {
    const view: LaunchOpsView = path.endsWith("/auth")
      ? "auth"
      : path.endsWith("/project")
        ? "project"
        : path.endsWith("/verification")
          ? "verification"
          : "dashboard";
    content = <LaunchOpsApp view={view} />;
  } else if (path.startsWith("/launch-demo/cinder-studio")) {
    const view: CinderView = path.includes("/project/")
      ? "project"
      : path.endsWith("/contact")
        ? "contact"
        : "home";
    content = <CinderStudioApp view={view} />;
  } else if (legacyDemoMatch?.[1] === "fieldflow") {
    content = <FieldFlowApp view="dashboard" />;
  } else if (legacyDemoMatch?.[1] === "launchops") {
    content = <LaunchOpsApp view="dashboard" />;
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
