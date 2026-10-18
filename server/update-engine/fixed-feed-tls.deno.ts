/** Local self-signed fixture only. Run with loopback-only network permission and
 * read permission to the generated certificate directory; never insecure flags.
 * These bytes exercise runtime TLS rejection, not the immutable feed destination.
 */
Deno.test('normal native HTTPS rejects local untrusted certificate', async () => {
  const cert = await Deno.readTextFile('/tmp/fixed-feed-tls/cert.pem');
  const key = await Deno.readTextFile('/tmp/fixed-feed-tls/key.pem');
  const server = Deno.serve({hostname:'127.0.0.1',port:0,cert,key,onListen:()=>{}},()=>new Response('fixture'));
  let failed = false;
  try {
    await fetch(`https://127.0.0.1:${server.addr.port}/`,{redirect:'error',credentials:'omit'});
  } catch (error) {
    failed = /certificate|issuer|invalid peer|UnknownIssuer/i.test(String(error));
  } finally { await server.shutdown(); }
  if (!failed) throw Error('expected normal certificate verification rejection');
});