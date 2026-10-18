import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { validateResearchImport, type PacketResult } from "@/lib/research/packet";

export function ResearchImportPreview() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<PacketResult | null>(null);
  return <section aria-labelledby="research-import-heading" className="border-y py-5 space-y-4">
    <h2 id="research-import-heading" className="text-xl font-semibold">Research packet · import preview</h2>
    <p className="text-sm text-muted-foreground">Version 1 · in memory only. Nothing is retrieved, saved or submitted. Validation does not verify the research.</p>
    <p className="text-sm text-muted-foreground">Workflow text, role, task, steps, prerequisites, limitations, citations, research/test dates, test status and unresolved claims have no backend storage in this preview.</p>
    <Label htmlFor="research-json">Research packets (JSON array, maximum 10 packets / 64 KiB)</Label>
    <Textarea id="research-json" rows={6} value={input} onChange={e => { setInput(e.target.value); setResult(null); }} />
    <div className="flex gap-2"><Button variant="outline" onClick={() => setResult(validateResearchImport(input))}>Validate preview</Button><Button variant="ghost" onClick={() => { setInput(""); setResult(null); }}>Clear</Button></div>
    {result?.ok === false && <ul role="alert" className="text-sm text-destructive list-disc pl-5">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
    {result?.ok === true && result.packets.map(p => <article key={p.id} className="border rounded-lg p-4 space-y-3 min-w-0">
      <h3 className="font-semibold break-words">{p.title}</h3>
      <p className="text-sm">{p.role} · {p.task} · {p.evidenceStatus} · {p.testStatus}</p>
      <p className="whitespace-pre-wrap break-words text-sm">{p.originalWorkflowText}</p>
      <h4 className="font-medium">Steps</h4><ol className="list-decimal pl-5 text-sm space-y-2">{p.steps.map((s,i) => <li className="break-words whitespace-pre-wrap" key={i}>{s}</li>)}</ol>
      <h4 className="font-medium">Prerequisites</h4><ul className="list-disc pl-5 text-sm">{p.prerequisites.map((s,i) => <li className="break-words" key={i}>{s}</li>)}</ul>
      <h4 className="font-medium">Limitations</h4><ul className="list-disc pl-5 text-sm">{p.limitations.map((s,i) => <li className="break-words" key={i}>{s}</li>)}</ul>
      <h4 className="font-medium">Citations · not retrieved</h4><ul className="text-sm space-y-2">{p.citations.map(c => <li key={c.url} className="break-words">{c.title} · {c.type}<br />{c.url}{c.videoTimestampSeconds !== undefined && <> · video timestamp {c.videoTimestampSeconds}s</>}</li>)}</ul>
      <dl className="text-sm space-y-1">{Object.entries(p.dates).map(([k,v]) => <div key={k}><dt className="inline font-medium">{k}: </dt><dd className="inline">{v ?? "Not recorded"}</dd></div>)}</dl>
      <h4 className="font-medium">Unresolved claims</h4><ul className="list-disc pl-5 text-sm">{p.unresolvedClaims.map((s,i) => <li className="break-words" key={i}>{s}</li>)}</ul>
    </article>)}
  </section>;
}
