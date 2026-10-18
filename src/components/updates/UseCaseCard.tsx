import { Badge } from "@/components/ui/badge";
import type { UseCase } from "@/lib/engine/discovery";

export function UseCaseCard({ title, useCase, sourceUrl }: { title: string; useCase: UseCase; sourceUrl: string }) {
  return <article className="rounded-lg border p-5 space-y-4 min-w-0">
    <div className="flex flex-wrap gap-2"><Badge variant="outline">Draft workflow idea</Badge><Badge variant="secondary">Not hands-on tested</Badge></div>
    <h3 className="text-lg text-foreground">{title}</h3>
    <div><h4 className="text-sm">Vendor announcement</h4><ul className="text-sm text-muted-foreground list-disc pl-5">{useCase.vendorFacts.map(f => <li key={f}>{f}</li>)}</ul></div>
    <div><h4 className="text-sm">Why consider it · editorial inference</h4><p className="text-sm text-muted-foreground">{useCase.problem} {useCase.editorialInference}</p></div>
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div><dt className="font-medium">Task</dt><dd className="text-muted-foreground">{useCase.task}</dd></div>
      <div><dt className="font-medium">Inputs</dt><dd className="text-muted-foreground">{useCase.requiredInputs.join("; ")}</dd></div>
      <div><dt className="font-medium">Setup effort</dt><dd className="text-muted-foreground">{useCase.effort}</dd></div>
      <div><dt className="font-medium">Cost</dt><dd className="text-muted-foreground">{useCase.cost.status === "known" ? useCase.cost.amount : "Unknown — confirm with vendor"}</dd></div>
      <div><dt className="font-medium">Integration needs</dt><dd className="text-muted-foreground">{useCase.integrationNeeds.join("; ")}</dd></div>
      <div><dt className="font-medium">Recorded test status</dt><dd className="text-muted-foreground">{useCase.test.status.replace(/_/g, " ")} · {useCase.test.recordedAt ?? "No test recorded"}</dd></div>
    </dl>
    <div><h4 className="text-sm">Suggested evaluation steps · not a tested procedure</h4><ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">{useCase.setupSteps.map(s => <li key={s}>{s}</li>)}</ol></div>
    <div><h4 className="text-sm">Limitations</h4><ul className="list-disc pl-5 text-sm text-muted-foreground">{useCase.limitations.map(l => <li key={l}>{l}</li>)}</ul></div>
    <a className="text-sm text-accent underline break-words" href={sourceUrl} target="_blank" rel="noopener noreferrer">Primary vendor announcement</a>
  </article>;
}