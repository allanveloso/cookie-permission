// Reduces a hostname to the "site" a decision applies to, so that
// accounts.example.com and www.example.com share one permission.
// This is a heuristic, not the full Public Suffix List: it handles
// example.com and example.co.uk style domains, which covers most sites.

const SECOND_LEVEL_LABELS = new Set(['co', 'com', 'org', 'net', 'gov', 'ac', 'edu', 'ne', 'or', 'go']);

function isIpOrLocal(host) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[') || !host.includes('.');
}

export function siteOf(hostname) {
  const host = hostname.replace(/\.$/, '').toLowerCase();
  if (isIpOrLocal(host)) return host;

  const labels = host.split('.');
  const n = labels.length;
  const hasSecondLevelSuffix =
    n >= 3 && labels[n - 1].length === 2 && SECOND_LEVEL_LABELS.has(labels[n - 2]);

  return labels.slice(hasSecondLevelSuffix ? -3 : -2).join('.');
}

export function siteOfUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return siteOf(parsed.hostname);
  } catch {
    return null;
  }
}

// Content setting pattern matching the site and all its subdomains.
export function patternFor(site) {
  return isIpOrLocal(site) ? `*://${site}/*` : `*://*.${site}/*`;
}
