import type { Template } from '@/src/lib/templates';

export function TemplateChips<T extends Record<string, any>>({
  templates,
  onPick,
}: {
  templates: Template<T>[];
  onPick: (t: Template<T>) => void;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-text-muted font-semibold mb-1.5">
        Quick start
      </div>
      <div className="flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className="group inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-full border border-border-card bg-surface-input hover:bg-surface-hover hover:border-olive/40 hover:-translate-y-px transition-all"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            title={t.prompt}
          >
            <span aria-hidden>{t.emoji}</span>
            <span className="text-text-body group-hover:text-olive">{t.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
