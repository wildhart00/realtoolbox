import { fixedGoogleWorkspaceAtomWire as wire } from './fixed-google-workspace-atom-wire.ts';
import { parseAtom } from './atom.ts';
import { runManualAtom, type ManualRpc } from './manual-atom.ts';
import { manualAtomHandler } from './manual-handler.proposal.ts';

const FEED = 'https://feeds.feedburner.com/GoogleAppsUpdates';
const assert = (value: unknown, message = 'assertion failed') => { if (!value) throw Error(message); };
const eq = (a: unknown, b: unknown) => assert(JSON.stringify(a) === JSON.stringify(b), `${JSON.stringify(a)} != ${JSON.stringify(b)}`);
async function rejects(work: () => Promise<unknown>) { let failed = false; try { await work(); } catch { failed = true; } assert(failed, 'expected rejection'); }
const response = (body = 'xml', headers: Record<string,string> = {}, status = 200) => new Response(body, {status,headers:{'content-type':'text/xml',...headers}});
async function mocked(mock: typeof fetch, work: () => Promise<void>) {
  const original = globalThis.fetch; globalThis.fetch = mock;
  try { await work(); } finally { globalThis.fetch = original; }
}
const call = () => wire(new URL(FEED), new AbortController().signal);
const entry = (n: number, link = `https://workspaceupdates.googleblog.com/2026/${n}.html`) => `<entry><id>${n}</id><title>Synthetic release ${n}</title><published>2026-10-${17-n}T00:00:00Z</published><updated>2026-10-17T00:00:00Z</updated><link href="${link}"/><content>publish immediately</content></entry>`;
const xml = `<feed xmlns="http://www.w3.org/2005/Atom">${entry(0)+entry(1)+entry(2)}</feed>`;
const now = () => '2026-10-18T17:24:00Z';

Deno.test('fixed literal and exact nonsecret native-fetch options', async () => {
  let calls = 0;
  await mocked(async (input, options) => {
    calls++; eq(input, FEED); eq(options?.method,'GET'); eq(options?.redirect,'error'); eq(options?.credentials,'omit');
    eq(options?.headers, {Accept:'application/atom+xml, application/xml, text/xml','User-Agent':'RealToolbox-WorkspaceAtom/0.1','Accept-Encoding':'identity'});
    assert(options?.signal instanceof AbortSignal); return response();
  }, async () => { eq((await call()).body,'xml'); eq(calls,1); });
});
Deno.test('altered destinations rejected before fetch', async () => {
  let calls = 0;
  await mocked(async () => {calls++;return response();}, async () => {
    for (const href of ['http://feeds.feedburner.com/GoogleAppsUpdates',FEED+'/',FEED+'?x=1',FEED+'#x',FEED.replace('feeds.','evil.'),FEED.replace('https://','https://user@'),FEED.replace('.com/','.com:444/'),FEED.toLowerCase()]) {
      await rejects(() => wire(new URL(href),new AbortController().signal));
    }
    eq(calls,0);
  });
});
Deno.test('redirect error and returned 302 never cause a second call', async () => {
  for (const throws of [true,false]) { let calls=0;
    await mocked(async (_input,options) => {calls++;eq(options?.redirect,'error');if(throws)throw TypeError('redirect');return response('',{location:'https://evil.invalid'},302);},async()=>{await rejects(call);eq(calls,1);});
  }
});
Deno.test('524288 boundary accepted; excess chunk and misleading length rejected with cancellation', async () => {
  await mocked(async()=>response('a'.repeat(524288),{'content-length':'1'}),async()=>eq((await call()).body.length,524288));
  for (const chunks of [[524289],[524288,1]]) { let canceled=false;
    const stream=new ReadableStream<Uint8Array>({start(c){for(const n of chunks)c.enqueue(new Uint8Array(n));},cancel(){canceled=true;}});
    await mocked(async()=>new Response(stream,{headers:{'content-type':'text/xml','content-length':'1'}}),async()=>{await rejects(call);assert(canceled);});
  }
});
Deno.test('eight-second deadline covers headers and stalled mid-body; cancels reader', async () => {
  const original=globalThis.setTimeout;
  try {
    for (const midbody of [false,true]) {
      let deadline: (()=>void)|undefined; let canceled=false; let signal: AbortSignal|null|undefined;
      globalThis.setTimeout=((fn:()=>void,ms:number)=>{eq(ms,8000);deadline=fn;return 1;}) as typeof setTimeout;
      await mocked(async(_input,opts)=>{signal=opts?.signal;if(!midbody)return await new Promise<Response>(()=>{});
        return new Response(new ReadableStream<Uint8Array>({start(c){c.enqueue(new Uint8Array([65]));},cancel(){canceled=true;}}),{headers:{'content-type':'text/xml'}});
      },async()=>{const pending=call();for(let i=0;i<8;i++)await Promise.resolve();assert(deadline);deadline?.();await rejects(()=>pending);assert(signal?.aborted);if(midbody)assert(canceled);});
    }
  } finally {globalThis.setTimeout=original;}
});
Deno.test('non200 MIME and encoding refusals cancel bodies',async()=>{
  for(const [status,headers] of [[500,{}],[200,{'content-type':'text/html'}],[200,{'content-type':'application/xmljunk'}],[200,{'content-encoding':'gzip'}]] as [number,Record<string,string>][]) {
    let canceled=false;
    await mocked(async()=>new Response(new ReadableStream({cancel(){canceled=true;}}),{status,headers:{'content-type':'text/xml',...headers}}),async()=>{await rejects(call);assert(canceled);});
  }
});
Deno.test('invalid UTF8 and stream failure cancel and reject',async()=>{
  for(const fail of [false,true]) {
    await mocked(async()=>new Response(new ReadableStream<Uint8Array>({start(c){if(fail)c.error(Error('stream failed'));else {c.enqueue(new Uint8Array([255]));c.close();}}}),{headers:{'content-type':'text/xml'}}),async()=>await rejects(call));
  }
});
Deno.test('upstream abort cancels stalled body',async()=>{
  const controller=new AbortController();let canceled=false;
  await mocked(async()=>new Response(new ReadableStream({cancel(){canceled=true;}}),{headers:{'content-type':'text/xml'}}),async()=>{const pending=wire(new URL(FEED),controller.signal);for(let i=0;i<5;i++)await Promise.resolve();controller.abort();await rejects(()=>pending);assert(canceled);});
});
Deno.test('XML entities truncated namespace and dates fail closed; malicious output ignored',()=>{
  for(const bad of ['<!DOCTYPE feed [<!ENTITY x SYSTEM "file:///etc/passwd">]>'+xml,xml.replace('Synthetic release 0','&unknown;'),'<feed',xml.replace('xmlns="http://www.w3.org/2005/Atom"','xmlns="wrong"')]) {
    let failed=false;try{parseAtom(bad,now());}catch{failed=true;}assert(failed);
  }
  eq(parseAtom(`<feed xmlns="http://www.w3.org/2005/Atom">${entry(0,'https://evil.invalid/a')}</feed>`,now()).length,0);
  eq(parseAtom(`<feed xmlns="http://www.w3.org/2005/Atom">${entry(0).replace('2026-10-17T00:00:00Z','2026-02-30T00:00:00Z')}</feed>`,now()).length,0);
  eq(parseAtom(xml,now()).map(e=>e.id),['0','1']);
});
Deno.test('whole fixed-wire path one fetch max2 drafts no publication',async()=>{
  const calls: [string,Record<string,unknown>][]=[];let fetches=0;
  const rpc:ManualRpc=async(name,args)=>{calls.push([name,args]);return {error:null,data:name==='engine_begin_atom_run'?'aaaaaaaa-0000-0000-0000-000000000001':name==='engine_finish_atom_run'?args._outcome:'queued'};};
  await mocked(async()=>{fetches++;return response(xml);},async()=>{const result=await runManualAtom({authorized:true,rpc,now});eq(result.created,2);eq(fetches,1);eq(calls.map(c=>c[0]),['engine_begin_atom_run','engine_record_atom_draft','engine_record_atom_draft','engine_finish_atom_run']);assert(!JSON.stringify(calls).includes('publish immediately'));});
});
Deno.test('handler success failure and lost-unpause response always restore pause',async()=>{
  for(const mode of ['success','fetch-failure','lost-unpause']) {let paused=true;let fetches=0;const pauses:boolean[]=[];
    const admin:ManualRpc=async(_name,args)=>{paused=args._paused===true;pauses.push(paused);if(mode==='lost-unpause'&&!paused)throw Error('lost response');return {data:paused,error:null};};
    const rpc:ManualRpc=async(name,args)=>({error:null,data:name==='engine_begin_atom_run'?'aaaaaaaa-0000-0000-0000-000000000001':name==='engine_finish_atom_run'?args._outcome:'queued'});
    await mocked(async()=>{fetches++;if(mode==='fetch-failure')throw TypeError('TLS verification failed');return response(xml);},async()=>{const h=manualAtomHandler({verifyAdmin:async()=>({userId:'synthetic',rpc:admin}),workerRpc:rpc});await h(new Request('https://local.invalid',{method:'POST'}));eq(pauses,[false,true]);assert(paused);eq(fetches,mode==='lost-unpause'?0:1);});
  }
});
Deno.test('native fetch permission denial without network permission; no insecure flags',async()=>{
  // The permission gate rejects before DNS/TCP; this is NOT a TLS certificate test.
  await rejects(()=>fetch('https://127.0.0.1:1/',{redirect:'error',credentials:'omit'}));
});