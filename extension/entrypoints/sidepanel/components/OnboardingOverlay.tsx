import { useState } from 'react';
import { MousePointerClick, ArrowLeftRight, History, ChevronRight, X, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Right-click to start',
    body: 'Right-click any image on a page and select "Generate variation with AnyCap" to open the side panel.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Switch capabilities',
    body: 'Use the tabs above to jump between Image, Video, Music, Search, and Crawl.',
  },
  {
    icon: History,
    title: 'Reuse your work',
    body: 'Every generation is saved in its tab. Click a thumbnail to rehydrate the form instantly.',
  },
];

export function OnboardingOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const StepIcon = STEPS[step].icon;

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else onDone();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-navy/60 backdrop-blur-sm px-6">
      <div
        className="relative w-full max-w-[260px] rounded-2xl bg-surface-card p-5 text-center"
        style={{ boxShadow: '0 24px 64px -16px rgba(28,31,23,0.35)' }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onDone}
          className="absolute top-3 right-3 p-1 rounded-full text-text-neutral hover:text-text-body hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/30"
          aria-label="Skip onboarding"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pale-sage to-cream-yellow flex items-center justify-center mx-auto"
          style={{ boxShadow: '0 6px 16px -8px rgba(107,125,58,0.5)' }}
        >
          <StepIcon className="w-6 h-6 text-olive" strokeWidth={1.8} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-text-primary mt-3">
          {STEPS[step].title}
        </h3>

        {/* Body */}
        <p className="text-xs text-text-body mt-1.5 leading-relaxed">
          {STEPS[step].body}
        </p>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`block w-1.5 h-1.5 rounded-full transition-colors ${
                i === step ? 'bg-olive' : 'bg-border-input'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={onDone}
            className="text-[11px] text-text-muted hover:text-text-body font-medium px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/30"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1 bg-olive text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-olive-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/30"
          >
            {step < STEPS.length - 1 ? (
              <>
                Next <ChevronRight className="w-3 h-3" />
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" /> Get Started
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
