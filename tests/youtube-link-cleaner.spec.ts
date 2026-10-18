import { afterEach, describe, expect, it } from 'vitest';
import { cleanYouTubeUrl } from '../src/clean-url';
import { observeYouTubeLinks } from '../src/observe-links';
import manifest from '../src/manifest.json';

describe('YouTube URL cleaning', () => {
    it.each([
        ['https://youtu.be/video?si=abc&t=90', 'https://youtu.be/video?t=90'],
        ['https://www.youtube.com/watch?v=id&si=x&list=PL123&index=2&t=1m30s#part', 'https://www.youtube.com/watch?v=id&list=PL123&index=2&t=1m30s#part'],
        ['https://m.youtube.com/shorts/id?feature=share&si=x', 'https://m.youtube.com/shorts/id'],
        ['https://music.youtube.com/watch?v=id&utm_source=chat&utm_medium=social&fbclid=x&gclid=y', 'https://music.youtube.com/watch?v=id'],
        ['http://youtube.com/watch?%73i=one&si=two&v=id', 'http://youtube.com/watch?v=id'],
        ['https://youtu.be/id?si=x#t=20', 'https://youtu.be/id#t=20'],
        ['https://youtube.com/watch?v=id&custom=a%20b%2fC&si=x', 'https://youtube.com/watch?v=id&custom=a%20b%2fC'],
        ['//youtu.be/id?si=x&t=30', '//youtu.be/id?t=30'],
    ])('cleans %s without discarding useful data', (input, expected) => {
        expect(cleanYouTubeUrl(input, 'https://example.test/')).toBe(expected);
        expect(cleanYouTubeUrl(expected, 'https://example.test/')).toBe(expected);
    });

    it.each([
        'https://example.test/watch?v=id&si=x',
        'https://youtube.com.example.test/watch?si=x',
        'https://notyoutube.com/watch?si=x',
        'https://youtube.com@example.test/watch?si=x',
        'https://youtu.be/id?t=90&list=PL123&index=2&unknown=keep',
        'https://youtu.be/id#si=x?si=y',
        'javascript:alert("https://youtu.be/id?si=x")',
        'mailto:person@youtube.com?si=x',
        'https://[invalid?si=x',
        'https://example.test/redirect?url=https%3A%2F%2Fyoutu.be%2Fid%3Fsi%3Dx',
    ])('leaves unrelated or already clean input intact: %s', input => {
        expect(cleanYouTubeUrl(input, 'https://example.test/')).toBe(input);
    });

    it('resolves relative links against their actual page base', () => {
        expect(cleanYouTubeUrl('/watch?v=id&si=x', 'https://youtube.com/')).toBe('/watch?v=id');
        expect(cleanYouTubeUrl('/watch?v=id&si=x', 'https://example.test/')).toBe('/watch?v=id&si=x');
    });
});

describe('page links', () => {
    let stop: (() => void) | undefined;
    const flush = () => new Promise(resolve => setTimeout(resolve, 10));

    afterEach(() => {
        stop?.();
        document.body.replaceChildren();
    });

    it('cleans existing links without changing their text or unrelated links', () => {
        document.body.innerHTML = '<a href="https://youtu.be/id?si=x&t=90">Watch video</a><a href="https://example.test/?si=x">Other</a>';
        stop = observeYouTubeLinks(document);
        expect(document.querySelector('a')?.getAttribute('href')).toBe('https://youtu.be/id?t=90');
        expect(document.querySelector('a')?.textContent).toBe('Watch video');
        expect(document.querySelectorAll('a')[1].getAttribute('href')).toBe('https://example.test/?si=x');
    });

    it('cleans new subtrees, image map links and changes to existing hrefs', async () => {
        stop = observeYouTubeLinks(document);
        const section = document.createElement('section');
        section.innerHTML = '<a href="https://youtube.com/watch?v=id&si=x">Video</a><map><area href="https://youtu.be/id?feature=share"></map>';
        document.body.append(section);
        await flush();
        const link = section.querySelector('a')!;
        expect(link.getAttribute('href')).toBe('https://youtube.com/watch?v=id');
        expect(section.querySelector('area')?.getAttribute('href')).toBe('https://youtu.be/id');
        link.setAttribute('href', 'https://youtu.be/new?si=y&t=4');
        await flush();
        expect(link.getAttribute('href')).toBe('https://youtu.be/new?t=4');
    });

    it.each(['click', 'auxclick', 'contextmenu', 'keydown', 'pointerdown'])('cleans before %s even before the observer runs', type => {
        stop = observeYouTubeLinks(document);
        document.body.innerHTML = '<a href="https://youtu.be/id?si=x"><span>Video</span></a>';
        document.querySelector('span')!.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
        expect(document.querySelector('a')?.getAttribute('href')).toBe('https://youtu.be/id');
    });

    it('disconnects its observer and event handlers', async () => {
        stop = observeYouTubeLinks(document);
        stop();
        document.body.innerHTML = '<a href="https://youtu.be/id?si=x">Video</a>';
        document.querySelector('a')!.dispatchEvent(new Event('click', { bubbles: true }));
        await flush();
        expect(document.querySelector('a')?.getAttribute('href')).toBe('https://youtu.be/id?si=x');
    });

    it('declares automatic HTTP(S) frame coverage without privileged APIs', () => {
        expect(manifest.manifest_version).toBe(3);
        expect(manifest.content_scripts[0]).toMatchObject({
            matches:    ['http://*/*', 'https://*/*'],
            all_frames: true,
            run_at:     'document_start',
        });
        expect(manifest).not.toHaveProperty('permissions');
        expect(manifest).not.toHaveProperty('background');
    });
});
