import { Fragment, ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Blog post renderer.
 *
 * The previous renderer handled headings, bullets, and blockquotes only — which
 * is not enough for the two post shapes this blog is actually for. Tool roundups
 * need numbered lists and links; head-to-head comparisons need tables. Both are
 * supported here, along with `---` rules for separating entries in a roundup.
 *
 * Markdown supported:
 *   ## H2, ### H3          section headings (anchored, feed the TOC)
 *   ---                    horizontal rule
 *   | a | b |              tables, with the usual |---|---| separator row
 *   - item                 bulleted list
 *   1. item                numbered list
 *   > quote                blockquote / pull-out
 *   **bold**  *italic*  `code`  [text](url)
 */

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** H2 headings, in document order — used to build a table of contents. */
export function extractHeadings(body: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  const re = /^##\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const text = m[1].trim();
    out.push({ id: slugifyHeading(text), text });
  }
  return out;
}

const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  INLINE_RE.lastIndex = 0;

  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];

    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-foreground/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const internal = href.startsWith("/");
        parts.push(
          internal ? (
            <Link
              key={key++}
              to={href}
              className="text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
            >
              {label}
            </Link>
          ) : (
            <a
              key={key++}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
            >
              {label}
            </a>
          ),
        );
      } else {
        parts.push(token);
      }
    } else {
      parts.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isTableBlock(block: string): boolean {
  const lines = block.split("\n");
  return (
    lines.length >= 2 &&
    lines[0].trim().startsWith("|") &&
    /^\|?[\s:-]*-[-\s|:]*\|?$/.test(lines[1].trim())
  );
}

/**
 * Comparison tables scroll inside their own container rather than pushing the
 * article column wide on a phone.
 */
function TableBlock({ block }: { block: string }) {
  const lines = block.split("\n").filter((l) => l.trim());
  const header = splitTableRow(lines[0]);
  const rows = lines.slice(2).map(splitTableRow);

  return (
    <div className="my-7 -mx-1 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b border-foreground/15">
            {header.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/60"
              >
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-foreground/[0.07] last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={
                    "px-3 py-3 align-top text-[13.5px] leading-[1.6] " +
                    (j === 0 ? "font-medium text-foreground" : "text-muted-foreground")
                  }
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlock(block: string, i: number): ReactNode {
  if (block.startsWith("### ")) {
    const text = block.slice(4);
    return (
      <h3
        key={i}
        id={slugifyHeading(text)}
        className="scroll-mt-24 mt-9 font-display text-[20px] font-semibold tracking-tight text-foreground"
      >
        {renderInline(text)}
      </h3>
    );
  }

  if (block.startsWith("## ")) {
    const text = block.slice(3);
    return (
      <h2
        key={i}
        id={slugifyHeading(text)}
        className="scroll-mt-24 mt-11 font-display text-[26px] font-bold tracking-tight text-foreground"
      >
        {renderInline(text)}
      </h2>
    );
  }

  if (/^---+$/.test(block.trim())) {
    return <hr key={i} className="my-10 border-foreground/10" />;
  }

  if (isTableBlock(block)) {
    return <TableBlock key={i} block={block} />;
  }

  if (block.startsWith("> ")) {
    const content = block
      .split("\n")
      .map((l) => l.replace(/^>\s?/, ""))
      .join("\n");
    return (
      <blockquote
        key={i}
        className="my-7 whitespace-pre-wrap rounded-xl border-l-[3px] border-[hsl(239_84%_67%)] bg-foreground/[0.03] px-5 py-4 text-[14.5px] leading-relaxed text-foreground/85"
      >
        {renderInline(content)}
      </blockquote>
    );
  }

  if (/^\d+\.\s/.test(block)) {
    const items = block.split("\n").map((l) => l.replace(/^\d+\.\s*/, ""));
    return (
      <ol key={i} className="mt-5 flex flex-col gap-2.5">
        {items.map((it, j) => (
          <li key={j} className="flex gap-3 text-[15px] text-muted-foreground leading-relaxed">
            <span className="mt-[1px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[hsl(239_84%_60%)]/15 text-[11px] font-bold text-[hsl(229_94%_82%)]">
              {j + 1}
            </span>
            <span>{renderInline(it)}</span>
          </li>
        ))}
      </ol>
    );
  }

  if (block.startsWith("- ")) {
    const items = block.split("\n").map((l) => l.replace(/^-\s*/, ""));
    return (
      <ul key={i} className="mt-5 flex flex-col gap-2.5">
        {items.map((it, j) => (
          <li key={j} className="flex gap-3 text-[15px] text-muted-foreground leading-relaxed">
            <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(229_94%_82%)]" />
            <span>{renderInline(it)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={i} className="mt-5 text-[15.5px] leading-[1.75] text-muted-foreground">
      {renderInline(block)}
    </p>
  );
}

/**
 * Renders a post body, optionally splicing a node (an email capture, a promo)
 * in after a given number of blocks so it lands inside the article rather than
 * only at the end.
 */
export function PostBody({
  body,
  injectAfterBlock,
  injected,
}: {
  body: string;
  injectAfterBlock?: number;
  injected?: ReactNode;
}) {
  const blocks = body.trim().split(/\n\n+/);
  const injectAt =
    injected && typeof injectAfterBlock === "number" && blocks.length > injectAfterBlock + 1
      ? injectAfterBlock
      : -1;

  return (
    <div>
      {blocks.map((block, i) => (
        <Fragment key={i}>
          {renderBlock(block, i)}
          {i === injectAt && injected}
        </Fragment>
      ))}
    </div>
  );
}
