import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

let initialized = false;

export function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      initialized = true;
    }
    if (!ref.current) return;
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    mermaid.render(id, code).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(() => {
      if (ref.current) {
        ref.current.innerHTML = `<pre class="text-sm text-muted-foreground p-2">${code}</pre>`;
      }
    });
  }, [code]);

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto rounded-lg border border-border bg-card p-4"
    />
  );
}
