const trackingParameters = new Set(['si', 'feature', 'gclid', 'fbclid']);

/** Remove known attribution parameters without re-encoding useful URL values. */
export function cleanYouTubeUrl(href: string, baseUrl: string): string {
    let url: URL;
    try {
        url = new URL(href, baseUrl);
    } catch {
        return href;
    }

    const host = url.hostname.toLowerCase();
    const isYouTube = host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com');
    if (!isYouTube || !['https:', 'http:'].includes(url.protocol)) return href;

    const hashIndex = href.indexOf('#');
    const beforeHash = hashIndex < 0 ? href : href.slice(0, hashIndex);
    const fragment = hashIndex < 0 ? '' : href.slice(hashIndex);
    const queryIndex = beforeHash.indexOf('?');
    if (queryIndex < 0) return href;

    const parameters = beforeHash.slice(queryIndex + 1).split('&');
    const kept = parameters.filter(parameter => {
        const name = new URLSearchParams(parameter).keys().next().value;
        return !name || (!trackingParameters.has(name) && !name.startsWith('utm_'));
    });
    if (kept.length === parameters.length) return href;

    const query = kept.join('&');
    return beforeHash.slice(0, queryIndex) + (query ? `?${query}` : '') + fragment;
}
