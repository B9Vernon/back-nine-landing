import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { REQUEST_DELAY_MS, USER_AGENT } from "./config.js";

export interface FetchedPage {
  url: string;
  html: string;
  status: number;
  contentType: string;
}

function isPrivateIp(address: string): boolean {
  if (address === "::1" || address.startsWith("fe80:") || address.startsWith("fc") || address.startsWith("fd")) return true;
  if (!address.includes(".")) return false;
  const parts = address.split(".").map(Number);
  const first = parts[0] ?? 0;
  const second = parts[1] ?? 0;
  return first === 10 || first === 127 || (first === 169 && second === 254) || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
}

async function assertPublicUrl(value: string): Promise<URL> {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Unsupported URL protocol: ${url.protocol}`);
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("Private hosts are not allowed.");
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error("Private IP addresses are not allowed.");
  } else {
    const addresses = await lookup(host, { all: true });
    if (addresses.some((entry) => isPrivateIp(entry.address))) throw new Error("Hosts resolving to a private IP are not allowed.");
  }
  return url;
}

function parseRobots(content: string, path: string): boolean {
  const lines = content.split(/\r?\n/).map((line) => line.replace(/#.*$/, "").trim()).filter(Boolean);
  let applies = false;
  const rules: Array<{ allow: boolean; path: string }> = [];
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      applies = value === "*" || value.toLowerCase().includes("backninehiringsignalengine");
    } else if (applies && (key === "allow" || key === "disallow") && value) {
      rules.push({ allow: key === "allow", path: value });
    }
  }
  const matches = rules.filter((rule) => path.startsWith(rule.path)).sort((a, b) => b.path.length - a.path.length);
  return matches[0]?.allow ?? true;
}

export class SafeWebClient {
  readonly delayMs: number;
  readonly userAgent: string;
  #lastRequest = new Map<string, number>();
  #robots = new Map<string, string>();

  constructor(options: { delayMs?: number; userAgent?: string } = {}) {
    this.delayMs = options.delayMs ?? REQUEST_DELAY_MS;
    this.userAgent = options.userAgent ?? USER_AGENT;
  }

  async #throttle(origin: string): Promise<void> {
    const wait = Math.max(0, (this.#lastRequest.get(origin) ?? 0) + this.delayMs - Date.now());
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    this.#lastRequest.set(origin, Date.now());
  }

  async #rawFetch(url: URL, redirects = 0, extraHeaders: Record<string, string> = {}): Promise<Response> {
    if (redirects > 5) throw new Error("Too many redirects.");
    await this.#throttle(url.origin);
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": this.userAgent, accept: "text/html,application/json,text/plain;q=0.8", ...extraHeaders },
      signal: AbortSignal.timeout(20_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return response;
      const next = await assertPublicUrl(new URL(location, url).toString());
      return this.#rawFetch(next, redirects + 1, extraHeaders);
    }
    return response;
  }

  async #isAllowed(url: URL): Promise<boolean> {
    let robots = this.#robots.get(url.origin);
    if (robots === undefined) {
      try {
        const response = await this.#rawFetch(new URL("/robots.txt", url.origin));
        robots = response.ok ? (await response.text()).slice(0, 512_000) : "";
      } catch {
        robots = "";
      }
      this.#robots.set(url.origin, robots);
    }
    return parseRobots(robots, `${url.pathname}${url.search}`);
  }

  async fetchPage(value: string): Promise<FetchedPage> {
    const url = await assertPublicUrl(value);
    if (!(await this.#isAllowed(url))) throw new Error(`robots.txt disallows ${url.pathname}`);
    const response = await this.#rawFetch(url);
    if ([401, 403, 407, 429].includes(response.status)) throw new Error(`Access restriction returned HTTP ${response.status}; no bypass attempted.`);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url.toString()}`);
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 2_000_000) throw new Error("Response exceeds the 2 MB safety limit.");
    const html = (await response.text()).slice(0, 2_000_000);
    if (/captcha|verify you are human|access denied|unusual traffic/i.test(html.slice(0, 100_000))) {
      throw new Error("Anti-bot or CAPTCHA page detected; no bypass attempted.");
    }
    return {
      url: response.url || url.toString(),
      html,
      status: response.status,
      contentType: response.headers.get("content-type") || "",
    };
  }

  async fetchJson(value: string, headers: Record<string, string> = {}): Promise<unknown> {
    const url = await assertPublicUrl(value);
    if (!(await this.#isAllowed(url))) throw new Error(`robots.txt disallows ${url.pathname}`);
    const response = await this.#rawFetch(url, 0, headers);
    if ([401, 403, 407, 429].includes(response.status)) throw new Error(`Access restriction returned HTTP ${response.status}; no bypass attempted.`);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url.toString()}`);
    const text = (await response.text()).slice(0, 2_000_000);
    return JSON.parse(text) as unknown;
  }
}
