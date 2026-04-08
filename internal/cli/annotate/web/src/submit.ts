// Submit: send annotations, annotated image, and recording to server.

import * as S from './state';
import { csrfToken, mediaType } from './config';
import { render, renderAnnotation } from './canvas';
import { stopRecording, getIsRecording, getRecordedChunks, getRecordingDuration, getHasRecordedClip } from './recording';
import { showToast, formatDuration } from './ui';

export async function submitAll(): Promise<void> {
  // Stop recording if active
  let recordingBlob: Blob | null = null;
  let submitRecDuration = 0;
  if (getIsRecording()) {
    recordingBlob = await stopRecording();
    submitRecDuration = getRecordingDuration();
  } else if (getHasRecordedClip() && getRecordedChunks().length > 0) {
    submitRecDuration = getRecordingDuration();
    recordingBlob = new Blob(getRecordedChunks(), { type: 'video/webm' });
  }

  const fd = new FormData();
  fd.append('csrf_token', csrfToken());

  // Annotations JSON
  if (S.annotations.length) {
    const out = S.annotations.map((a) => {
      const o: Record<string, unknown> = { id: a.id, type: a.type, label: a.label };
      if (a.bounds) o.bounds = a.bounds;
      if (a.from) o.from = a.from;
      if (a.to) o.to = a.to;
      if (a.position) o.position = a.position;
      if (a.points) o.points = a.points;
      return o;
    });
    fd.append('annotations', JSON.stringify(out));
  }

  // Annotated image export - per media type.
  let hasAnnotatedImage = false;
  const mt = mediaType();

  if (S.annotations.length && S.canvas) {
    if (mt === 'image' && S.originalImage && S.originalImage.naturalWidth) {
      // Image mode: composite original image + annotations at full resolution.
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = S.originalImage.naturalWidth;
      exportCanvas.height = S.originalImage.naturalHeight;
      const exportCtx = exportCanvas.getContext('2d')!;
      exportCtx.drawImage(S.originalImage, 0, 0);
      for (let i = 0; i < S.annotations.length; i++) renderAnnotation(exportCtx, S.annotations[i], true);
      fd.append('image_dimensions', JSON.stringify({
        width: S.originalImage.naturalWidth, height: S.originalImage.naturalHeight,
      }));
      try {
        const imgBlob = await new Promise<Blob | null>((r) => exportCanvas.toBlob(r, 'image/png'));
        if (imgBlob) { fd.append('annotated_image', imgBlob, 'annotated.png'); hasAnnotatedImage = true; }
      } catch (_err) { /* ignore */ }

    } else if (mt === 'video' && S.videoEl && S.videoEl.videoWidth) {
      // Video mode: grab current video frame + draw annotations at video resolution.
      const vw = S.videoEl.videoWidth;
      const vh = S.videoEl.videoHeight;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = vw;
      exportCanvas.height = vh;
      const exportCtx = exportCanvas.getContext('2d')!;
      exportCtx.drawImage(S.videoEl, 0, 0, vw, vh);
      for (let i = 0; i < S.annotations.length; i++) renderAnnotation(exportCtx, S.annotations[i], true);
      fd.append('image_dimensions', JSON.stringify({ width: vw, height: vh }));
      try {
        const imgBlob = await new Promise<Blob | null>((r) => exportCanvas.toBlob(r, 'image/png'));
        if (imgBlob) { fd.append('annotated_image', imgBlob, 'annotated.png'); hasAnnotatedImage = true; }
      } catch (_err) { /* ignore */ }

    } else if (mt === 'audio') {
      // Audio mode: export canvas (grid background + annotations).
      render();
      fd.append('image_dimensions', JSON.stringify({ width: S.canvas.width, height: S.canvas.height }));
      try {
        const imgBlob = await new Promise<Blob | null>((r) => S.canvas!.toBlob(r, 'image/png'));
        if (imgBlob) { fd.append('annotated_image', imgBlob, 'annotated.png'); hasAnnotatedImage = true; }
      } catch (_err) { /* ignore */ }
    }
    // URL mode: no annotated image (cross-origin iframe prevents capture).
  }

  // Recording
  const hasRecording = recordingBlob != null && recordingBlob.size > 0;
  if (hasRecording) {
    fd.append('recording', recordingBlob!, 'recording.webm');
    fd.append('recording_duration', String(submitRecDuration));
  }

  // Build submit summary
  const summary = buildSubmitSummary(S.annotations.length, hasRecording, submitRecDuration, hasAnnotatedImage);

  try {
    const resp = await fetch('/submit', { method: 'POST', body: fd });
    if (resp.ok) {
      const body = await resp.json();
      if (body.closing) {
        // Replace page with a "done" screen. Server is shutting down.
        document.body.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100vh;' +
          'font-family:system-ui,sans-serif;color:#aaa;background:#1a1a2e;flex-direction:column;gap:16px">' +
          '<div style="font-size:24px;font-weight:600">Session Complete</div>' +
          '<div style="font-size:14px;opacity:0.7">Saved: ' + summary + '</div>' +
          '<div style="font-size:13px;opacity:0.4">You can close this tab.</div></div>';
      } else {
        showToast('Saved: ' + summary);
      }
    } else {
      showToast('Save failed: ' + resp.statusText, true);
    }
  } catch (err: unknown) {
    showToast('Save failed: ' + (err as Error).message, true);
  }
}

function buildSubmitSummary(annCount: number, hasRec: boolean, recDur: number, hasImage: boolean): string {
  const parts: string[] = [];
  if (annCount > 0) parts.push(annCount + (annCount === 1 ? ' annotation' : ' annotations'));
  if (hasImage) parts.push('annotated image');
  if (hasRec) parts.push('recording (' + formatDuration(recDur) + ')');
  if (!parts.length) return 'no changes';
  return parts.join(', ');
}
