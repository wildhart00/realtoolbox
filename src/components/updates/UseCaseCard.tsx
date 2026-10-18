import { Badge } from "@/components/ui/badge";
import type { UseCase } from "@/lib/engine/discovery";

export function UseCaseCard({ title, useCase, sourceUrl }: { title: string; useCase: UseCase; sourceUrl: string }) {
  return <article className="rounded-xl border border-foreground/12 bg-card p-5 sm:p-6 space-y-4 min-w-0">
    <div className="flex flex-wrap gap-2"><Badge variant="outline">Draft workflow idea</Badge><Badge variant="secondary">Not hands-on tested</Badge></div>
    <h3 className="font-display text-[20px] leading-tight text-foreground">{title}</h3>
    <div><h4 className="text-[14px]">Vendor announcement</h4><ul className="text-[14px] text-muted-foreground list-disc pl-5">{useCase.vendorFacts.map(f => <li key={f}>{f}</li>)}</ul></div>
    <div><h4 className="text-[14px]">Why consider it · editorial inference</h4><p className="text-[14px] text-muted-foreground">{useCase.problem} {useCase.editorialInference}</p></div>
    <details className="group"><summary className="min-h-11 flex items-center cursor-pointer text-[14px] font-medium text-accent">Task, inputs, cost, steps and limits</summary><div className="mt-3 space-y-4">
    <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
      <div><dt className="font-medium">Task</dt><dd className="text-muted-foreground">{useCase.task}</dd></div>
      <div><dt className="font-medium">Inputs</dt><dd className="text-muted-foreground">{useCase.requiredInputs.join("; ")}</dd></div>
      <div><dt className="font-medium">Setup effort</dt><dd className="text-muted-foreground">{useCase.effort}</dd></div>
      <div><dt className="font-medium">Cost</dt><dd className="text-muted-foreground">{useCase.cost.status === "known" ? useCase.cost.amount : "Unknown — confirm with vendor"}</dd></div>
      <div><dt className="font-medium">Integration needs</dt><dd className="text-muted-foreground">{useCase.integrationNeeds.join("; ")}</dd></div>
      <div><dt className="font-medium">Recorded test status</dt><dd className="text-muted-foreground">{useCase.test.status.replace(/_/g, " ")} · {useCase.test.recordedAt ?? "No test recorded"}</dd></div>
    </dl>
    <div><h4 className="text-[14px]">Suggested evaluation steps · not a tested procedure</h4><ol className="list-decimal pl-5 text-[14px] text-muted-foreground space-y-1">{useCase.setupSteps.map(s => <li key={s}>{s}</li>)}</ol></div>
    <div><h4 className="text-[14px]">Limitations</h4><ul className="list-disc pl-5 text-[14px] text-muted-foreground">{useCase.limitations.map(l => <li key={l}>{l}</li>)}</ul></div></div></details>
    <a className="text-[14px] text-accent underline break-words" href={sourceUrl} target="_blank" rel="noopener noreferrer">Primary vendor announcement</a>
  </article>;
}