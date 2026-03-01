import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, Code, Quote, Minus, Link2, List } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  required?: boolean;
}

// ─── Toolbar config ───────────────────────────────────────────────────────────

type WrapAction = { kind: 'wrap'; prefix: string; suffix: string; placeholder: string };
type LineAction = { kind: 'line'; prefix: string };
type BlockAction = { kind: 'block'; text: string };

type ToolbarItem = {
  label: string;
  icon?: React.ReactNode;
  title: string;
  action: WrapAction | LineAction | BlockAction;
};

const TOOLBAR: ToolbarItem[] = [
  {
    label: 'B',
    icon: <Bold className="h-3.5 w-3.5" />,
    title: '굵게 (Bold)',
    action: { kind: 'wrap', prefix: '**', suffix: '**', placeholder: '굵은 텍스트' },
  },
  {
    label: 'I',
    icon: <Italic className="h-3.5 w-3.5" />,
    title: '기울기 (Italic)',
    action: { kind: 'wrap', prefix: '*', suffix: '*', placeholder: '기울임 텍스트' },
  },
  {
    label: 'H2',
    title: '제목 2 (H2)',
    action: { kind: 'line', prefix: '## ' },
  },
  {
    label: 'H3',
    title: '제목 3 (H3)',
    action: { kind: 'line', prefix: '### ' },
  },
  {
    label: '`',
    icon: <Code className="h-3.5 w-3.5" />,
    title: '인라인 코드',
    action: { kind: 'wrap', prefix: '`', suffix: '`', placeholder: 'code' },
  },
  {
    label: '```',
    title: '코드 블록',
    action: { kind: 'block', text: '```\n코드를 입력하세요\n```' },
  },
  {
    label: '"',
    icon: <Quote className="h-3.5 w-3.5" />,
    title: '인용 (Blockquote)',
    action: { kind: 'line', prefix: '> ' },
  },
  {
    label: '—',
    icon: <Minus className="h-3.5 w-3.5" />,
    title: '구분선',
    action: { kind: 'block', text: '\n---\n' },
  },
  {
    label: '[링크]',
    icon: <Link2 className="h-3.5 w-3.5" />,
    title: '링크 삽입',
    action: { kind: 'wrap', prefix: '[', suffix: '](url)', placeholder: '링크 텍스트' },
  },
  {
    label: '- 목록',
    icon: <List className="h-3.5 w-3.5" />,
    title: '목록 (List)',
    action: { kind: 'line', prefix: '- ' },
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const MarkdownEditor = ({
  value,
  onChange,
  placeholder,
  rows = 8,
  label,
  required = false,
}: MarkdownEditorProps) => {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const ref = useRef<HTMLTextAreaElement>(null);

  // Wrap selected text with prefix/suffix
  const handleWrap = (prefix: string, suffix: string, ph: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end) || ph;
    const newVal =
      value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(newVal);
    const cursorEnd = start + prefix.length + selected.length + suffix.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursorEnd, cursorEnd);
    });
  };

  // Insert prefix at start of current line
  const handleLine = (prefix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const newVal = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    onChange(newVal);
    const newPos = start + prefix.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newPos, newPos);
    });
  };

  // Insert a block of text at cursor
  const handleBlock = (text: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const newVal = value.substring(0, start) + text + value.substring(start);
    onChange(newVal);
    const newPos = start + text.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newPos, newPos);
    });
  };

  const handleToolbar = (item: ToolbarItem) => {
    const { action } = item;
    if (action.kind === 'wrap') handleWrap(action.prefix, action.suffix, action.placeholder);
    else if (action.kind === 'line') handleLine(action.prefix);
    else handleBlock(action.text);
  };

  const minH = `min-h-[${Math.max(rows * 24, 160)}px]`;

  return (
    <div>
      {/* Header row: label + tabs */}
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
              tab === 'edit'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
              tab === 'preview'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            미리보기
          </button>
        </div>
      </div>

      {/* Toolbar (edit only) */}
      {tab === 'edit' && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 rounded-t-md border border-b-0 border-input bg-muted/40">
          {TOOLBAR.map((item) => (
            <button
              key={item.title}
              type="button"
              title={item.title}
              onClick={() => handleToolbar(item)}
              className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors min-w-[1.75rem]"
            >
              {item.icon ?? item.label}
            </button>
          ))}
        </div>
      )}

      {/* Edit tab: Textarea */}
      {tab === 'edit' && (
        <Textarea
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`font-mono text-sm rounded-t-none ${minH} resize-y`}
        />
      )}

      {/* Preview tab: rendered markdown */}
      {tab === 'preview' && (
        <div
          className={`overflow-y-auto p-3 rounded-md border border-input bg-background text-sm ${minH} max-h-[500px]`}
        >
          {value.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mt-6 mb-3 first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mt-5 mb-2 border-b border-border pb-1">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="my-2 leading-relaxed text-foreground/90">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 pl-5 space-y-1 list-disc marker:text-accent">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 pl-5 space-y-1 list-decimal marker:text-accent">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="my-3 pl-4 border-l-4 border-accent/50 text-muted-foreground italic">
                    {children}
                  </blockquote>
                ),
                code: ({
                  inline,
                  children,
                  ...props
                }: {
                  inline?: boolean;
                  children?: React.ReactNode;
                  [key: string]: unknown;
                }) =>
                  inline ? (
                    <code
                      className="px-1 py-0.5 rounded bg-muted text-accent text-[0.85em] font-mono"
                      {...(props as React.HTMLAttributes<HTMLElement>)}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className="block p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto"
                      {...(props as React.HTMLAttributes<HTMLElement>)}
                    >
                      {children}
                    </code>
                  ),
                pre: ({ children }) => (
                  <pre className="my-3 rounded-lg overflow-hidden">{children}</pre>
                ),
                table: ({ children }) => (
                  <div className="my-3 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-semibold border-b border-border">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 border-b border-border/50">{children}</td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline underline-offset-2 hover:text-accent/80"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt ?? ''}
                    className="my-3 rounded-lg max-w-full border border-border"
                  />
                ),
                hr: () => <hr className="my-4 border-border" />,
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic text-xs">(미리보기 내용 없음)</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
