import { cleanYouTubeUrl } from './clean-url';

/** Clean URL labels only when they still describe the link's destination. */
export function cleanLinkText(link: Element, href: string, baseUrl: string): void {
    const before = link.textContent ?? '';
    const label = before.trim();
    if (!label || /\s/.test(label)) return;

    let prefix = '';
    let cleaned: string;
    try {
        const destination = new URL(href, baseUrl);
        if (/^(?:[a-z0-9-]+\.)*youtube\.com\/|^youtu\.be\//i.test(label)) {
            prefix = `${destination.protocol}//`;
        } else if (label.startsWith('//')) {
            prefix = destination.protocol;
        } else if (!/^https?:\/\//i.test(label)) {
            return;
        }

        const candidate = prefix + label;
        cleaned = cleanYouTubeUrl(candidate, baseUrl);
        if (cleaned === candidate || new URL(cleaned, baseUrl).href !== destination.href) return;
    } catch {
        return;
    }

    const labelStart = before.indexOf(label);
    const after = before.slice(0, labelStart) + cleaned.slice(prefix.length) + before.slice(labelStart + label.length);
    let start = 0;
    while (before[start] === after[start] && start < after.length) start++;
    let end = before.length;
    let afterEnd = after.length;
    while (end > start && afterEnd > start && before[end - 1] === after[afterEnd - 1]) {
        end--;
        afterEnd--;
    }

    // Edit text nodes in place so nested spans, icons and event listeners survive.
    const walker = link.ownerDocument.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    let offset = 0;
    let inserted = false;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node as Text;
        const length = text.data.length;
        const from = Math.max(0, start - offset);
        const to = Math.min(length, end - offset);
        if (from < to) {
            const replacement = inserted ? '' : after.slice(start, afterEnd);
            text.replaceData(from, to - from, replacement);
            inserted = true;
        }
        offset += length;
    }
}
