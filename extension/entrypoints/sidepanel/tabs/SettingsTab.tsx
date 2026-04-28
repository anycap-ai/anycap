import { useEffect, useState } from 'react';
import {
  User,
  Image as ImageIcon,
  Film,
  Music,
  Shield,
  RotateCcw,
  ExternalLink,
  Code2,
  Info,
} from 'lucide-react';
import { useStore } from '@/src/lib/store';
import {
  loadSettings,
  saveSettings,
  resetSettings,
  resetTrial,
  DEFAULT_SETTINGS,
  type UserSettings,
} from '@/src/lib/settings';
import { getAuthState } from '@/src/lib/quota';
import { MOCK_MODE } from '@/src/lib/constants';

const IMAGE_MODELS = ['nano-banana-2', 'seedream-5', 'flux-dev'];
const VIDEO_MODELS = ['veo-3-1', 'kling-2', 'sora-1'];
const MUSIC_MODELS = ['lyria-2', 'suno-v4', 'udio-1'];

export function SettingsTab() {
  const store = useStore();
  const [s, setS] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    (async () => {
      const fresh = await loadSettings();
      setS(fresh);
      setLoaded(true);
    })();
  }, []);

  // Persist on change (debounced via setTimeout effect chain)
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      await saveSettings(s);
      setSavedAt(Date.now());
    }, 200);
    return () => clearTimeout(t);
  }, [s, loaded]);

  const onResetTrial = async () => {
    await resetTrial();
    const state = await getAuthState();
    store.setAuthState(state.isAuthed, state.remainingTrials);
    store.setView('generate');
    setSavedAt(Date.now());
  };

  const onResetSettings = async () => {
    const fresh = await resetSettings();
    setS(fresh);
    setSavedAt(Date.now());
  };

  return (
    <div className="space-y-5">
      <Section icon={User} title="Profile">
        <Field label="Display name (optional)">
          <input
            type="text"
            value={s.displayName}
            onChange={(e) => setS({ ...s, displayName: e.target.value })}
            placeholder="Anonymous"
            className="w-full text-sm border border-border-input bg-surface-input rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
          />
        </Field>
        <p className="text-[11px] text-text-neutral">
          Account login coming soon — anonymous users get 3 free tries / month.
        </p>
      </Section>

      <Section icon={ImageIcon} title="Default models">
        <Field label="Image">
          <ModelSelect value={s.defaultImageModel} onChange={(v) => setS({ ...s, defaultImageModel: v })} options={IMAGE_MODELS} />
        </Field>
        <Field label="Video" icon={Film}>
          <ModelSelect value={s.defaultVideoModel} onChange={(v) => setS({ ...s, defaultVideoModel: v })} options={VIDEO_MODELS} />
        </Field>
        <Field label="Music" icon={Music}>
          <ModelSelect value={s.defaultMusicModel} onChange={(v) => setS({ ...s, defaultMusicModel: v })} options={MUSIC_MODELS} />
        </Field>
      </Section>

      <Section icon={Shield} title="Privacy & display">
        <Toggle
          label="Reduced motion"
          description="Disable subtle animations and hover lifts."
          checked={s.reducedMotion}
          onChange={(v) => setS({ ...s, reducedMotion: v })}
        />
        <Toggle
          label="Watermark on results"
          description="Free tier always watermarks; pro can opt out."
          checked={!s.watermarkOptOut}
          onChange={(v) => setS({ ...s, watermarkOptOut: !v })}
          disabled={!store.isAuthed}
        />
      </Section>

      <Section icon={RotateCcw} title="Maintenance">
        <button
          onClick={onResetTrial}
          className="w-full text-left text-sm border border-border-card bg-surface-input rounded-xl px-3 py-2.5 hover:bg-surface-hover hover:border-border-input-hover card-hover"
        >
          <div className="font-medium text-text-primary">Reset free trial counter</div>
          <div className="text-[11px] text-text-neutral mt-0.5">
            Restore 3 free tries — useful while building demos.
          </div>
        </button>
        <button
          onClick={onResetSettings}
          className="w-full text-left text-sm border border-border-card bg-surface-input rounded-xl px-3 py-2.5 hover:bg-surface-hover hover:border-border-input-hover card-hover"
        >
          <div className="font-medium text-text-primary">Reset all settings to defaults</div>
          <div className="text-[11px] text-text-neutral mt-0.5">Models, watermark, motion — back to factory.</div>
        </button>
      </Section>

      <Section icon={Info} title="About">
        <div className="rounded-xl border border-border-card bg-surface-input p-3 space-y-1.5 text-[12px]">
          <Row label="Version" value="0.2.0" />
          <Row label="Mode" value={MOCK_MODE ? 'demo (mock)' : 'production'} />
          <Row
            label="Trials"
            value={
              store.isAuthed
                ? 'signed in'
                : store.remainingTrials === Infinity
                  ? 'unlimited'
                  : `${store.remainingTrials}/3 free`
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <ExternalRow icon={Code2} href="https://github.com/anycap-ai/anycap" label="anycap-ai/anycap" />
          <ExternalRow icon={ExternalLink} href="https://anycap.ai/privacy/extension" label="Privacy policy" />
          <ExternalRow icon={ExternalLink} href="https://anycap.ai/pricing" label="Pricing & plans" />
        </div>
      </Section>

      {savedAt > 0 && (
        <p className="text-[10px] text-text-neutral text-center">
          Saved · {new Date(savedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-muted font-semibold">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof User;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="inline-flex items-center gap-1 text-[11px] text-text-muted font-medium mb-1">
        {Icon ? <Icon className="w-3 h-3" /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}

function ModelSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-border-input bg-surface-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
    >
      {options.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-full flex items-start justify-between gap-3 rounded-xl border border-border-card bg-surface-input px-3 py-2.5 text-left card-hover ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-[11px] text-text-neutral mt-0.5 leading-snug">{description}</div>
      </div>
      <span
        className={`shrink-0 inline-block w-9 h-5 rounded-full p-0.5 transition-colors ${
          checked ? 'bg-olive' : 'bg-border-input'
        }`}
        aria-hidden
      >
        <span
          className={`block w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
        />
      </span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}

function ExternalRow({
  icon: Icon,
  href,
  label,
}: {
  icon: typeof User;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-between text-sm border border-border-card bg-surface-input rounded-xl px-3 py-2 hover:bg-surface-hover hover:border-border-input-hover card-hover"
    >
      <span className="inline-flex items-center gap-2 text-text-body">
        <Icon className="w-4 h-4" /> {label}
      </span>
      <ExternalLink className="w-3.5 h-3.5 text-text-neutral" />
    </a>
  );
}
