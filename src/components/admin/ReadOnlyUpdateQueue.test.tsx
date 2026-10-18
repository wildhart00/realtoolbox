import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
const m = vi.hoisted(() => ({ auth:{user:{id:"admin-a"} as {id:string}|null,session:{access_token:"test-session"},loading:false},rpc:vi.fn(),read:vi.fn() }));
vi.mock("@/hooks/useAuth", () => ({ useAuth:() => m.auth }));
vi.mock("@/integrations/supabase/client", () => ({supabase:{rpc:m.rpc}}));
vi.mock("@/lib/updates/readOnly", () => ({readPrivateQueue:m.read,QUEUE_LIMIT:50,EVENT_LIMIT:200}));
import { ReadOnlyUpdateQueue } from "./ReadOnlyUpdateQueue";
const candidate={id:"c1",title:"Private title",draft_summary:"Private summary",canonical_url:"https://vendor.example/a",state:"queued"};
describe("private queue authorization and isolation", () => {
  beforeEach(()=>{m.auth.user={id:"admin-a"};m.auth.loading=false;vi.clearAllMocks();m.rpc.mockResolvedValue({data:true,error:null});m.read.mockResolvedValue({candidates:[candidate],events:[]});});
  it("waits for server authorization before any private query", async()=>{
    let resolve:(v:unknown)=>void=()=>{};m.rpc.mockImplementation(()=>new Promise(r=>{resolve=r;}));render(<ReadOnlyUpdateQueue/>);
    expect(m.read).not.toHaveBeenCalled();expect(screen.getByRole("status")).toHaveTextContent("Checking admin");
    await act(async()=>resolve({data:true,error:null}));
    expect(await screen.findByRole("heading", { name: "Private title" })).toBeInTheDocument();expect(m.rpc).toHaveBeenCalledWith("has_role",{_user_id:"admin-a",_role:"admin"});
  });
  it.each([{data:false,error:null},{data:true,error:{message:"denied"}}])("denies failed/nonadmin checks without SELECT",async result=>{
    m.rpc.mockResolvedValue(result);render(<ReadOnlyUpdateQueue/>);expect(await screen.findByRole("alert")).toHaveTextContent("verified admin");expect(m.read).not.toHaveBeenCalled();
  });
  it("distinguishes empty and error states",async()=>{m.read.mockRejectedValue(new Error("denied"));render(<ReadOnlyUpdateQueue/>);expect(await screen.findByRole("alert")).toHaveTextContent("No empty-queue conclusion");expect(screen.queryByText("No private candidates.")).not.toBeInTheDocument();});
  it("renders empty without claiming unavailable",async()=>{m.read.mockResolvedValue({candidates:[],events:[]});render(<ReadOnlyUpdateQueue/>);expect(await screen.findByText("No private candidates.")).toBeInTheDocument();expect(screen.queryByRole("alert")).not.toBeInTheDocument();});
  it("removes private data immediately on account switch and logout",async()=>{
    const view=render(<ReadOnlyUpdateQueue/>);await screen.findByRole("heading", { name: "Private title" });
    m.rpc.mockImplementation(()=>new Promise(()=>{}));m.auth.user={id:"member-b"};view.rerender(<ReadOnlyUpdateQueue/>);
    expect(screen.queryByRole("heading", { name: "Private title" })).not.toBeInTheDocument();expect(m.read).toHaveBeenCalledTimes(1);
    m.auth.user=null;view.rerender(<ReadOnlyUpdateQueue/>);expect(screen.getByRole("alert")).toHaveTextContent("verified admin");expect(screen.queryByText("Private summary")).not.toBeInTheDocument();
  });
  it("ignores late private read after logout and aborts it",async()=>{
    let resolve:(v:unknown)=>void=()=>{};m.read.mockImplementation(()=>new Promise(r=>{resolve=r;}));const view=render(<ReadOnlyUpdateQueue/>);await waitFor(()=>expect(m.read).toHaveBeenCalledTimes(1));const signal=m.read.mock.calls[0][0] as AbortSignal;
    m.auth.user=null;view.rerender(<ReadOnlyUpdateQueue/>);expect(signal.aborted).toBe(true);
    await act(async()=>resolve({candidates:[candidate],events:[]}));expect(screen.queryByRole("heading", { name: "Private title" })).not.toBeInTheDocument();
  });
  it("all live controls are disabled/disconnected with zero mutating RPCs",async()=>{
    render(<ReadOnlyUpdateQueue/>);await screen.findByRole("heading", { name: "Private title" });for(const name of ["Review","Approve","Publish","Withdraw","Pause"])expect(screen.getByRole("button",{name})).toBeDisabled();
    expect(m.rpc.mock.calls.map(c=>c[0])).toEqual(["has_role"]);
  });
});
