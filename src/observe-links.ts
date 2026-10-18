import { cleanYouTubeUrl } from './clean-url';

/** Observe only link destinations and added subtrees, never page text. */
export function observeYouTubeLinks(document: Document): () => void {
    const selector = 'a[href], area[href]';

    const cleanLink = (element: Element) => {
        if (!element.matches(selector)) return;
        const href = element.getAttribute('href');
        if (href === null) return;
        const cleaned = cleanYouTubeUrl(href, document.baseURI);
        if (cleaned !== href) element.setAttribute('href', cleaned);
    };

    const cleanTree = (node: Node) => {
        if (node instanceof Element) {
            cleanLink(node);
            node.querySelectorAll(selector).forEach(cleanLink);
        }
    };

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.target instanceof Element) {
                cleanLink(mutation.target);
            } else {
                mutation.addedNodes.forEach(cleanTree);
            }
        }
    });
    observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    document.querySelectorAll(selector).forEach(cleanLink);

    // Cover interaction before a queued mutation callback, including keyboard,
    // middle-click and the browser's Copy link address context menu.
    const beforeInteraction = (event: Event) => {
        for (const target of event.composedPath()) {
            if (target instanceof Element && target.matches(selector)) {
                cleanLink(target);
                break;
            }
        }
    };
    const events = ['pointerdown', 'click', 'auxclick', 'contextmenu', 'keydown'];
    events.forEach(type => document.addEventListener(type, beforeInteraction, true));

    return () => {
        observer.disconnect();
        events.forEach(type => document.removeEventListener(type, beforeInteraction, true));
    };
}
