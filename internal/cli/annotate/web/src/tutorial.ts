// Tutorial overlay for URL and video modes.
// Shows a quick-start guide on first open, dismissible and remembered via localStorage.

import { mediaType } from './config';

const STORAGE_KEY = 'anycap_annotate_tutorial_dismissed';

interface TutorialStep {
  icon: string;
  title: string;
  desc: string;
}

const URL_STEPS: TutorialStep[] = [
  {
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>',
    title: 'Browse & Annotate',
    desc: 'Switch between <b>Browse</b> mode to interact with the page and annotation tools (<b>Rect</b>, <b>Arrow</b>, <b>Point</b>, <b>Free</b>) to mark areas of interest.',
  },
  {
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/></svg>',
    title: 'Record Your Feedback',
    desc: 'Click <b>Rec</b> to capture your screen and narrate your thoughts. The recording helps the agent understand your visual feedback in context.',
  },
  {
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 13l4 4L19 7"/></svg>',
    title: 'Click Done',
    desc: 'When finished, click <b>Done</b> to submit your annotations and recording.',
  },
];

const VIDEO_STEPS: TutorialStep[] = [
  {
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg>',
    title: 'Play & Annotate',
    desc: '<b>Pause</b> the video at key moments and use annotation tools (<b>Rect</b>, <b>Arrow</b>, <b>Point</b>, <b>Free</b>) to mark areas on the current frame.',
  },
  {
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/></svg>',
    title: 'Record Your Walkthrough',
    desc: 'Click <b>Rec</b> to capture your screen and narrate what you see. Play through the video while explaining your feedback aloud.',
  },
  {
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 13l4 4L19 7"/></svg>',
    title: 'Click Done',
    desc: 'When finished, click <b>Done</b> to submit your annotations and recording.',
  },
];

function shouldShow(): boolean {
  const mt = mediaType();
  if (mt !== 'url' && mt !== 'video') return false;
  try {
    const key = STORAGE_KEY + '_' + mt;
    return localStorage.getItem(key) !== '1';
  } catch (_e) {
    return true;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY + '_' + mediaType(), '1');
  } catch (_e) { /* ignore */ }
}

export function showTutorial(): void {
  if (!shouldShow()) return;

  const mt = mediaType();
  const steps = mt === 'url' ? URL_STEPS : VIDEO_STEPS;
  const title = mt === 'url' ? 'Web Page Review' : 'Video Review';
  const subtitle = mt === 'url'
    ? 'Annotate the page and record your feedback for the agent.'
    : 'Annotate video frames and record your walkthrough for the agent.';

  const overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';
  overlay.innerHTML =
    '<div class="tutorial-card">' +
      '<div class="tutorial-header">' +
        '<div class="tutorial-title">' + title + '</div>' +
        '<div class="tutorial-subtitle">' + subtitle + '</div>' +
      '</div>' +
      '<div class="tutorial-steps">' +
        steps.map((s, i) =>
          '<div class="tutorial-step">' +
            '<div class="tutorial-step-num">' + (i + 1) + '</div>' +
            '<div class="tutorial-step-icon">' + s.icon + '</div>' +
            '<div class="tutorial-step-content">' +
              '<div class="tutorial-step-title">' + s.title + '</div>' +
              '<div class="tutorial-step-desc">' + s.desc + '</div>' +
            '</div>' +
          '</div>'
        ).join('') +
      '</div>' +
      '<div class="tutorial-tip">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> ' +
        (mt === 'url'
          ? 'The recording is key -- it captures exactly what you see and say, helping the agent understand your feedback.'
          : 'Recording captures both the video playback and your narration, giving the agent full context.') +
      '</div>' +
      '<div class="tutorial-footer">' +
        '<label class="tutorial-remember"><input type="checkbox" id="tutorial-remember-cb" checked> Don\'t show again</label>' +
        '<button class="tool-btn primary tutorial-dismiss" id="tutorial-dismiss">Got it</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => overlay.classList.add('visible'));

  const dismiss = (): void => {
    const cb = document.getElementById('tutorial-remember-cb') as HTMLInputElement;
    if (cb && cb.checked) markDismissed();
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 200);
  };

  document.getElementById('tutorial-dismiss')!.addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismiss();
  });
}
