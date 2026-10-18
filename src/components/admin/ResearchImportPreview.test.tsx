import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResearchImportPreview } from "./ResearchImportPreview";
const packet = {schemaVersion:1,id:"p1",title:"Atlas workflow",originalWorkflowText:"Research text",role:"agent",task:"Review source data",steps:["Organize inputs"],prerequisites:[],limitations:["Verify independently"],citations:[{type:"primary_source",url:"https://vendor.example/a",title:"Vendor"}],dates:{sourcePublishedAt:null,sourceCheckedAt:null,researchedAt:"2026-10-18T00:00:00Z",editorialPublishedAt:null,testedAt:null},evidenceStatus:"unverified",testStatus:"not_tested",unresolvedClaims:["Unknown availability"]};
describe("in-memory import preview",()=>{
  it("validates, displays rich fields without links/retrieval/persistence and clears",()=>{
    const fetch=vi.spyOn(globalThis,"fetch");const store=vi.spyOn(Storage.prototype,"setItem");render(<ResearchImportPreview/>);
    fireEvent.change(screen.getByLabelText(/Research packets/),{target:{value:JSON.stringify([packet])}});fireEvent.click(screen.getByRole("button",{name:"Validate preview"}));
    expect(screen.getByRole("heading",{name:"Atlas workflow"})).toBeInTheDocument();expect(screen.getByText("Unknown availability")).toBeInTheDocument();expect(screen.queryAllByRole("link")).toHaveLength(0);expect(fetch).not.toHaveBeenCalled();expect(store).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button",{name:"Clear"}));expect(screen.queryByText("Atlas workflow")).not.toBeInTheDocument();fetch.mockRestore();store.mockRestore();
  });
  it("editing an import clears old valid preview",()=>{render(<ResearchImportPreview/>);fireEvent.change(screen.getByLabelText(/Research packets/),{target:{value:JSON.stringify([packet])}});fireEvent.click(screen.getByRole("button",{name:"Validate preview"}));fireEvent.change(screen.getByLabelText(/Research packets/),{target:{value:"bad"}});expect(screen.queryByText("Atlas workflow")).not.toBeInTheDocument();fireEvent.click(screen.getByRole("button",{name:"Validate preview"}));expect(screen.getByRole("alert")).toHaveTextContent("Invalid JSON");});
});
