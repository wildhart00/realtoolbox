/** PREPARATION ONLY: not under supabase/functions, so cannot auto-deploy.
 * Later packaging: put modules in function-local lib with explicit npm imports.
 * Only authenticated, server-verified admins; no arbitrary body/URL/source input.
 */
import {runManualAtom, type ManualRpc} from './manual-atom.ts';
export interface VerifiedAdmin {userId: string; rpc: ManualRpc}
export function manualAtomHandler(deps: {
  verifyAdmin: (authorization: string) => Promise<VerifiedAdmin|null>;
  workerRpc: ManualRpc;
  collect?: typeof runManualAtom;
}) {
  return async (request: Request): Promise<Response> => {
    if(request.method!=='POST')return Response.json({error:'method_denied'},{status:405});
    if(request.headers.get('content-length') && request.headers.get('content-length')!=='0')return Response.json({error:'body_denied'},{status:400});
    if((await request.text()).length)return Response.json({error:'body_denied'},{status:400});
    const admin=await deps.verifyAdmin(request.headers.get('authorization')??'');
    if(!admin)return Response.json({error:'admin_required'},{status:403});
    let restorationRequired=false;
    let response: Response;
    try {
      restorationRequired=true;
      const open=await admin.rpc('set_update_engine_paused',{_paused:false});
      if(open.error || open.data!==false)throw Error('pause_gate_refused');
      const result=await (deps.collect??runManualAtom)({authorized:true,rpc:deps.workerRpc,now:()=>new Date().toISOString()});
      response=Response.json(result);
    } catch { response=Response.json({error:'manual_run_incomplete'},{status:503}); }
    finally {
      if(restorationRequired) {
        try {
          const close=await admin.rpc('set_update_engine_paused',{_paused:true});
          if(close.error || close.data!==true) response=Response.json({error:'re_pause_required'},{status:503});
        } catch { response=Response.json({error:'re_pause_required'},{status:503}); }
      }
    }
    return response;
  };
}
