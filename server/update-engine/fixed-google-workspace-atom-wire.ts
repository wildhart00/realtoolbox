import type { Wire } from './transport.ts';

const FEED = 'https://feeds.feedburner.com/GoogleAppsUpdates';
const MAX_BYTES = 524288;
const TIMEOUT_MS = 8000;

/** ONE immutable trusted feed. Native runtime DNS and normal HTTPS verification;
 * no DNS precheck, resolved-IP validation or pinning. Never a general URL fetcher.
 */
export const fixedGoogleWorkspaceAtomWire: Wire = async (url, upstreamSignal) => {
  if (url.href !== FEED) throw new Error('fixed_feed_url_required');
  const controller = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const abort = () => controller.abort();
  upstreamSignal.addEventListener('abort', abort, { once: true });
  if (upstreamSignal.aborted) abort();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const aborted = new Promise<never>((_, reject) => {
    controller.signal.addEventListener('abort', () => reject(new Error('feed_aborted')), { once: true });
    if (controller.signal.aborted) reject(new Error('feed_aborted'));
    timer = setTimeout(abort, TIMEOUT_MS);
  });
  try {
    const response = await Promise.race([fetch(FEED, {
      method: 'GET', redirect: 'error', credentials: 'omit', signal: controller.signal,
      headers: {
        Accept: 'application/atom+xml, application/xml, text/xml',
        'User-Agent': 'RealToolbox-WorkspaceAtom/0.1',
        'Accept-Encoding': 'identity',
      },
    }), aborted]);
    reader = response.body?.getReader();
    if (response.status !== 200 || response.redirected) throw new Error('feed_http_or_redirect_denied');
    const mime = response.headers.get('content-type') ?? '';
    const encoding = response.headers.get('content-encoding');
    if (!/^(?:text\/xml|application\/(?:xml|atom\+xml))(?:;|$)/i.test(mime) ||
      (encoding !== null && encoding !== 'identity')) throw new Error('unsupported_feed_content');
    if (!reader) throw new Error('missing_feed_body');
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const chunk = await Promise.race([reader.read(), aborted]);
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BYTES) throw new Error('byte_limit');
      chunks.push(chunk.value);
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    return { status: 200, headers: { 'content-type': mime, 'content-encoding': 'identity' },
      body: new TextDecoder('utf-8', { fatal: true }).decode(body) };
  } catch (error) {
    // Do not wait indefinitely for a hostile/broken stream's cancel promise.
    if (reader) void reader.cancel().catch(() => {});
    controller.abort();
    throw error;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    upstreamSignal.removeEventListener('abort', abort);
    reader?.releaseLock();
  }
};