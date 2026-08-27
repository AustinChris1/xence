/**
 * Just enough markdown for our own /docs files. Input is trusted repo content,
 * but escaped anyway so a stray angle bracket never becomes markup.
 */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(raw: string): string {
  return esc(raw)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
      const external = /^https?:/.test(href);
      return `<a href="${href}"${external ? ` target="_blank" rel="noreferrer"` : ""}>${text}</a>`;
    });
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !lines[i].startsWith("```")) code.push(lines[i]);
      out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,3}) (.+)$/);
    if (heading) {
      flush();
      const level = heading[1].length;
      out.push(`<h${level} id="${slugify(heading[2])}">${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^-{3,}$/.test(line.trim())) {
      flush();
      out.push("<hr />");
      continue;
    }

    if (line.startsWith("> ")) {
      flush();
      const quote: string[] = [line.slice(2)];
      while (i + 1 < lines.length && lines[i + 1].startsWith("> ")) quote.push(lines[++i].slice(2));
      out.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    if (/^- /.test(line)) {
      flush();
      const items: string[] = [];
      i--;
      // A list item continues over indented follow-on lines.
      while (i + 1 < lines.length && /^- /.test(lines[i + 1])) {
        let item = lines[++i].slice(2);
        while (i + 1 < lines.length && /^ {2,}\S/.test(lines[i + 1])) item += " " + lines[++i].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (line.startsWith("| ")) {
      flush();
      const rows: string[][] = [];
      i--;
      while (i + 1 < lines.length && lines[i + 1].startsWith("|")) {
        const cells = lines[++i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(cells);
      }
      const [head, ...body] = rows;
      out.push(
        `<div class="doc-table"><table><thead><tr>${head
          .map((c) => `<th>${inline(c)}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    if (line.trim() === "") flush();
    else paragraph.push(line.trim());
  }

  flush();
  return out.join("\n");
}
