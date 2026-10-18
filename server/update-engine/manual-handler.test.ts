import {describe,it,expect,vi} from 'vitest';
import {manualAtomHandler} from './manual-handler.proposal';
describe('manual admin boundary',()=>{
 it('denies unsigned callers without any worker access',async()=>{
  const workerRpc=vi.fn();const handler=manualAtomHandler({verifyAdmin:async()=>null,workerRpc});
  expect((await handler(new Request('https://local.invalid',{method:'POST'}))).status).toBe(403);expect(workerRpc).not.toHaveBeenCalled();
 });
 it('rejects arbitrary input',async()=>{
  const verifyAdmin=vi.fn();const handler=manualAtomHandler({verifyAdmin,workerRpc:vi.fn()});
  expect((await handler(new Request('https://local.invalid',{method:'POST',body:'https://evil.example'}))).status).toBe(400);expect(verifyAdmin).not.toHaveBeenCalled();
 });
 it('repauses after collection success or failure',async()=>{
  for(const fail of [false,true]) {
   const rpc=vi.fn(async(_name:string,args:Record<string,unknown>)=>({data:args._paused,error:null}));
   const collect=vi.fn(async()=>{if(fail)throw Error('failed');return {runId:'test',outcome:'no_change' as const,created:0,submitted:2,requests:1}});
   const handler=manualAtomHandler({verifyAdmin:async()=>({userId:'synthetic-admin',rpc}),workerRpc:vi.fn(),collect});
   expect((await handler(new Request('https://local.invalid',{method:'POST'}))).status).toBe(fail?503:200);
   expect(rpc.mock.calls.map(c=>c[1]._paused)).toEqual([false,true]);
  }
 });
 it('reports re-pause failure instead of claiming safe completion',async()=>{
  const rpc=vi.fn(async(_name:string,args:Record<string,unknown>)=>({data:args._paused,error:args._paused?'denied':null}));
  const handler=manualAtomHandler({verifyAdmin:async()=>({userId:'synthetic-admin',rpc}),workerRpc:vi.fn(),collect:async()=>({runId:'test',outcome:'changed',created:1,submitted:1,requests:1})});
  expect(await (await handler(new Request('https://local.invalid',{method:'POST'}))).json()).toEqual({error:'re_pause_required'});
 });
});
