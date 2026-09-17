const API_URL = "https://events.vercount.one/api/v2/log";
const REQUEST_TIMEOUT = 5000;
const UV_COOKIE_PREFIX = "vercount_uv_";
const UV_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type CounterData = {
  site_pv: number;
  page_pv: number;
  site_uv: number;
};

let inflight: AbortController | null = null;
let lastTrackedUrl = "";
let lastTrackedAt = 0;

function uvCookieName() {
  const host = window.location.host || "unknown-host";
  return `${UV_COOKIE_PREFIX}${host.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function hasUvCookie() {
  return document.cookie
    .split("; ")
    .some(entry => entry === `${uvCookieName()}=1`);
}

function setUvCookie() {
  document.cookie = `${uvCookieName()}=1; path=/; max-age=${UV_COOKIE_MAX_AGE}; samesite=lax`;
}

function extract(payload: unknown): CounterData | null {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as {
    data?: Record<string, unknown>;
    site_pv?: unknown;
    page_pv?: unknown;
    site_uv?: unknown;
  };
  const src =
    root.data && typeof root.data === "object" ? root.data : (root as Record<string, unknown>);

  const site_pv = Number(src.site_pv ?? 0);
  const page_pv = Number(src.page_pv ?? 0);
  const site_uv = Number(src.site_uv ?? 0);
  if ([site_pv, page_pv, site_uv].some(n => Number.isNaN(n))) return null;

  return { site_pv, page_pv, site_uv };
}

function fill(id: string, value: number) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value.toLocaleString();
}

function show(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  el.classList.remove("hidden");
}

function isLocalHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

async function track() {
  const url = window.location.href;
  if (!url.startsWith("http") || isLocalHost()) return;

  const now = Date.now();
  if (url === lastTrackedUrl && now - lastTrackedAt < 1000) return;
  lastTrackedUrl = url;
  lastTrackedAt = now;

  inflight?.abort();
  inflight = new AbortController();
  const timeout = window.setTimeout(() => inflight?.abort(), REQUEST_TIMEOUT);

  const isNewUv = !hasUvCookie();
  if (isNewUv) setUvCookie();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, isNewUv }),
      signal: inflight.signal,
    });
    if (!response.ok) return;

    const data = extract(await response.json());
    if (!data) return;

    fill("vercount_value_page_pv", data.page_pv);
    fill("vercount_value_site_pv", data.site_pv);
    fill("vercount_value_site_uv", data.site_uv);
    show("vercount_container_site");
  } catch {
    // aborted or network error: leave placeholders hidden
  } finally {
    window.clearTimeout(timeout);
  }
}

document.addEventListener("astro:page-load", track);
