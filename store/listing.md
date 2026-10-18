# Chrome Web Store submission

## Name

Link Cleaner

## Short description

Automatically clean tracking parameters from YouTube links across websites, while keeping timestamps and playlists.

## Detailed description

Keep the video. Lose the tracking parameters.

Link Cleaner automatically removes known tracking parameters from YouTube links
on the websites you browse. Install it and browse normally: there is no account,
popup or extra click required.

• Cleans youtube.com and youtu.be links, including YouTube subdomains.
• Removes si, feature, utm_ campaign parameters, gclid and fbclid.
• Keeps video IDs, timestamps, playlists, playlist positions and other parameters.
• Updates visible URL labels when they match the cleaned destination.
• Keeps custom labels such as “Watch video” intact.
• Handles links added or changed as a page updates.

Everything runs locally in your browser. Link Cleaner does not save browsing
history, send page content anywhere or use analytics.

WHY WEBSITE ACCESS?
YouTube links appear across the web. Link Cleaner needs access to those pages to
find and clean their links automatically. You can restrict site access using
Chrome's extension controls.

WHAT IT DOESN'T DO
Link Cleaner currently supports YouTube links. It does not clean the address bar,
text outside links, share-dialog fields or links wrapped in another site's
redirect URL. Protected browser pages and links in shadow trees are not covered.
Removing link parameters does not block YouTube's other tracking mechanisms.

## Single purpose

Automatically remove known tracking parameters from supported links on web pages,
while preserving their destinations and useful playback parameters.

## Host-access justification

HTTP and HTTPS access across websites is required because supported YouTube links
can appear on any website. The content script reads link destinations and link
text, cleans supported URLs, and observes link changes. Limiting access to
youtube.com would prevent cleaning links shared on other websites. Processing is
local; no browsing data is retained or transmitted. No additional privileged APIs
are requested.

## Remote code

Select “No, I am not using remote code.” All executable code is bundled in the
extension ZIP. The extension has no network requests or remotely loaded scripts.

## Data-handling disclosure

Link Cleaner locally accesses website link URLs and text solely to clean links.
It does not retain or transmit that information, collect analytics, sell data,
use data for unrelated purposes or use data for creditworthiness decisions.
The privacy policy documents this local access as well as the absence of storage
and transmission. Match the dashboard's data-use fields to these facts; do not
describe the extension as having no access to website content.

## Links

- Privacy policy: https://rutgeruijtendaal.github.io/link-cleaner/
- Homepage: https://github.com/RutgerUijtendaal/link-cleaner
- Support: https://github.com/RutgerUijtendaal/link-cleaner/issues

## Reviewer test instructions

No login, subscription or credentials are required. Install the ZIP, allow site
access, and open an ordinary HTTP(S) page containing an anchor to
`https://youtu.be/VIDEO?si=example&t=90`. Its href becomes
`https://youtu.be/VIDEO?t=90`. If its visible text is that URL, the label is cleaned
too. A custom label such as “Watch video” stays unchanged. Newly inserted anchors
are cleaned automatically. The demonstration page source used for the screenshots
is `store/demo.html`; serve it over localhost HTTP to reproduce the examples.

## Submission files

- Package: `dist/link-cleaner.zip` (build with `npm run build`).
- Store icon: `src/icons/icon-128.png` (128 × 128, transparent padding).
- Small promotional image: `store/promo-440x280.png`.
- Screenshot 1: `store/screenshot-clean-links.png` (1280 × 800).
- Screenshot 2: `store/screenshot-preserve-context.png` (1280 × 800).

The screenshots show the actual extension running on a labelled demonstration
page, not an extension popup. No store listing or submission is created by the
repository workflows. Upload these materials through the developer dashboard.
