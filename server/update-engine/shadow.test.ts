// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { fetchOfficial, officialLinks, publicAddress, type Wire } from "./http";
import { collectShadow, parseMetadata, type Rpc } from "./shadow";
const src = "appfolio-newsroom";
const primary = 'https://www.appfolio.com/newsroom/example';
const meta = '<script type="application/ld+json">{"@type":"NewsArticle","headline":"Synthetic announcement title","datePublished":"2026-10-01"}</script>';
const response = (body: string) => ({ status: 200, headers: { "content-type": "text/html" }, body });
describe("shadow preparation", () => {
  it("denies private and special-use DNS addresses", () => {
    for (const ip of ['127.0.0.1','10.2.3.4','169.254.1.2','100.64.1.1','172.31.1.1','192.168.1.1','198.18.1.1','::1','8.8.8.8'])
      expect(publicAddress(ip)).toBe(ip === '8.8.8.8');
  });
  it("blocks arbitrary links before transport", async () => {
    const wire = vi.fn();
    for (const u of ['https://evil.example/a','https://www.appfolio.com.evil.com/newsroom/x','https://user@www.appfolio.com/newsroom/x','https://www.appfolio.com:8443/newsroom/x','https://www.appfolio.com/newsroom/%2e%2e/x'])
      await expect(fetchOfficial(src,u,wire)).rejects.toThrow();
    expect(wire).not.toHaveBeenCalled();
  });
  it("validates redirect hosts before following", async () => {
    const wire = vi.fn(async () => ({status:302,headers:{location:'https://127.0.0.1/x'},body:''}));
    await expect(fetchOfficial(src,primary,wire)).rejects.toThrow(); expect(wire).toHaveBeenCalledTimes(1);
  });
  it("bounds bytes and redirect loops", async () => {
    await expect(fetchOfficial(src,primary,async () => response('x'.repeat(524289)))).rejects.toThrow('byte_limit');
    const wire = vi.fn(async () => ({status:302,headers:{location:primary},body:''}));
    await expect(fetchOfficial(src,primary,wire)).rejects.toThrow('redirect_limit'); expect(wire).toHaveBeenCalledTimes(3);
  });
  it("bounds elapsed time", async () => {
    vi.useFakeTimers();
    const pending = expect(fetchOfficial(src,primary,() => new Promise(() => {}))).rejects.toThrow('timeout');
    await vi.advanceTimersByTimeAsync(8000); await pending; vi.useRealTimers();
  });
  it("ignores unvetted index links and bounds details", () => {
    expect(officialLinks(src,`<a href="https://evil.example/x">x</a><a href="${primary}">a</a><a href="${primary}">b</a>`)).toEqual([primary]);
  });
  it("parses metadata not descriptions and rejects stale/malformed", () => {
    expect(parseMetadata(meta,'2026-10-18T17:00Z')).toEqual({title:'Synthetic announcement title',date:'2026-10-01'});
    expect(() => parseMetadata(meta.replace('2026-10-01','2025-01-01'),'2026-10-18T17:00Z')).toThrow();
    expect(() => parseMetadata('<script type="application/ld+json">bad</script>','2026-10-18')).toThrow();
  });
  it("reserves then submits a primary-source draft and completes fixed log counters", async () => {
    const calls: {name:string;args:Record<string,unknown>}[]=[];
    const rpc: Rpc=async(name,args)=>{ calls.push({name,args});return {data:name==='engine_begin_shadow_run'?'fixture-run':'queued',error:null}; };
    const wire: Wire=async u=>response(u.href===primary?meta:`<a href="${primary}">link</a>`);
    expect(await collectShadow(src,{authorized:true,rpc,wire,now:'2026-10-18T17:00Z'})).toEqual({outcome:'changed',created:1,requests:2});
    expect(calls.map(c=>c.name)).toEqual(['engine_begin_shadow_run','engine_record_revision','engine_finish_shadow_run']);
    expect(calls[1]?.args._flags).toContain('hands_on_not_tested');
    expect(calls[1]?.args._flags).toContain('metadata_only_primary');
  });
  it("denial never fetches; failure never commits a snapshot", async () => {
    const wire=vi.fn(); const rpc=vi.fn(async()=>({data:null,error:'denied'}));
    await expect(collectShadow(src,{authorized:true,rpc,wire,now:'2026-10-18'})).rejects.toThrow('rpc_refused'); expect(wire).not.toHaveBeenCalled();
    const finish: Record<string,unknown>[]=[];
    const ok: Rpc=async(name,args)=>{if(name==='engine_finish_shadow_run')finish.push(args);return {data:'fixture',error:null};};
    await collectShadow(src,{authorized:true,rpc:ok,wire:async()=>{throw new Error('secret raw error');},now:'2026-10-18'});
    expect(finish[0]).toMatchObject({_outcome:'failed',_snapshot:null}); expect(JSON.stringify(finish)).not.toContain('secret');
  });
});