import { cleanYouTubeUrl } from './clean-url';
import { cleanLinkText } from './clean-link-text';

/** Keep link destinations and matching URL labels clean as pages change. */
export function observeYouTubeLinks(document: Document): () => void {
    const selector = 'a[href], area[href]';

    const cleanLink = (element: Element) => {
        if (!element.matches(selector)) return;
        const href = element.getAttribute('href');
        if (href === null) return;
        const cleaned = cleanYouTubeUrl(href, document.baseURI);
        if (cleaned !== href) element.setAttribute('href', cleaned);
        cleanLinkText(element, cleaned, document.baseURI);
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
                const parent = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
                const link = parent?.closest(selector);
                if (link) cleanLink(link);
            }
        }
    });
    observer.observe(document, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href'],
    });
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
