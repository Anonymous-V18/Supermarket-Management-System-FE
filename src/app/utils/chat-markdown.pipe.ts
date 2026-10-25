import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'chatMarkdown',
  standalone: true,
})
export class ChatMarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(raw: string | null | undefined): SafeHtml {
    if (!raw) {
      return '';
    }
    const lines = escapeHtml(raw).replace(/\r\n/g, '\n').split('\n');
    const html = renderMarkdownLines(lines);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

function renderMarkdownLines(lines: string[]): string {
  const html: string[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();

    // Collapsible block: :::details <title> ... :::
    if (line.startsWith(':::details')) {
      flushParagraph();
      const title = (line.substring(10).trim() || 'Chi tiết').replace(/^[👉📥🔗\s]+/, '');
      const detailLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        detailLines.push(lines[i]);
        i++;
      }
      html.push(
        `<details class="rag-details"><summary class="rag-summary"><i class="bi bi-chevron-down me-1"></i>${title}</summary><div class="rag-details-content">${renderMarkdownLines(detailLines)}</div></details>`
      );
    } else if (line.startsWith(':::chart')) {
      // Visual chart block: :::chart <title> ... :::
      flushParagraph();
      const title = line.substring(8).trim() || 'Biểu đồ';
      const chartLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        if (lines[i].trim()) {
          chartLines.push(lines[i].trim());
        }
        i++;
      }
      html.push(renderChart(title, chartLines));
    } else if (isTableRow(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      flushParagraph();
      const rows: string[] = [line];
      i += 2;
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(lines[i]);
        i++;
      }
      i--;
      html.push(table(rows));
    } else if (/^\s*[-*+] /.test(line) || /^\s*\d{1,2}[.)] /.test(line)) {
      flushParagraph();
      const ordered = /^\s*\d/.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\s*\d{1,2}[.)] /.test(lines[i]) : /^\s*[-*+] /.test(lines[i]))) {
        items.push(`<li>${inline(lines[i].replace(/^\s*(?:[-*+]|\d{1,2}[.)]) /, ''))}</li>`);
        i++;
      }
      i--;
      html.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
    } else if (/^#{1,6} /.test(line)) {
      flushParagraph();
      html.push(`<p class="rag-md-heading">${inline(line.replace(/^#{1,6} /, ''))}</p>`);
    } else if (!line.trim()) {
      flushParagraph();
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  return html.join('');
}

function renderChart(title: string, lines: string[]): string {
  const rowsHtml: string[] = [];
  for (const line of lines) {
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length < 2) continue;
    const label = parts[0];
    const displayVal = parts.length > 2 ? parts[2] : parts[1];
    const percent = parts.length > 3 ? parts[3] : '50%';
    rowsHtml.push(
      `<div class="rag-chart-row">` +
        `<div class="rag-chart-label" title="${label}">${label}</div>` +
        `<div class="rag-chart-bar-bg"><div class="rag-chart-bar-val" style="width: ${percent};"></div></div>` +
        `<div class="rag-chart-num">${displayVal}</div>` +
      `</div>`
    );
  }
  return (
    `<div class="rag-chart-container">` +
      `<div class="rag-chart-header"><i class="bi bi-bar-chart-line-fill me-2 text-primary"></i>${title}</div>` +
      `<div class="rag-chart-body">${rowsHtml.join('')}</div>` +
    `</div>`
  );
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith('|');
}

function isSeparator(line: string): boolean {
  return /^\s*\|(\s*:?-{3,}:?\s*\|)+\s*$/.test(line);
}

function cells(row: string): string[] {
  return row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => inline(cell.trim()));
}

function table(rows: string[]): string {
  const [header, ...body] = rows;
  const head = cells(header).map((cell) => `<th>${cell}</th>`).join('');
  const bodyRows = body.map((row) => `<tr>${cells(row).map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('');
  return `<div class="rag-md-table"><table><thead><tr>${head}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="rag-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[(\d{1,2})\]/g, '<sup class="rag-cite">[$1]</sup>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
      if (url.startsWith('data:text/csv')) {
        const parts = url.split('#');
        const realUrl = parts[0];
        const fileName = parts[1] || 'bao-cao.csv';
        return `<a href="${realUrl}" download="${fileName}" class="btn btn-sm btn-outline-success rag-download-btn"><i class="bi bi-file-earmark-arrow-down-fill me-1"></i>${label.replace(/^[👉📥🔗\s]+/, '')}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="rag-link">${label.replace(/^[👉📥🔗\s]+/, '')}</a>`;
    });
}
