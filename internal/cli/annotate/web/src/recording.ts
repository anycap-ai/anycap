// Recording: screen capture with mic audio.

import * as S from './state';
import { showToast, formatDuration } from './ui';

// Recording-local state
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingStartTime = 0;
let isRecording = false;
let recordingDuration = 0;
let hasRecordedClip = false;
let micStream: MediaStream | null = null;
let captureStream: MediaStream | null = null;
let recTimerInterval: ReturnType<typeof setInterval> | null = null;

export function getIsRecording(): boolean {
  return isRecording;
}

export function getRecordedChunks(): Blob[] {
  return recordedChunks;
}

export function getRecordingDuration(): number {
  return recordingDuration;
}

export function getHasRecordedClip(): boolean {
  return hasRecordedClip;
}

export async function toggleRecording(): Promise<void> {
  if (isRecording) {
    await stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording(): Promise<void> {
  try {
    recordedChunks = [];

    // Get mic audio for narration
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Screen-record the current tab via getDisplayMedia.
    let videoStream: MediaStream;
    try {
      videoStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as MediaTrackConstraints,
        preferCurrentTab: true,
      } as DisplayMediaStreamOptions);
    } catch (_displayErr) {
      // Fallback: capture canvas only
      videoStream = S.canvas!.captureStream(15);
    }
    captureStream = videoStream;

    const combined = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...micStream.getAudioTracks(),
    ]);

    // Try VP9 first, fallback to VP8
    let mimeType = 'video/webm; codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm; codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    mediaRecorder = new MediaRecorder(combined, {
      mimeType,
      videoBitsPerSecond: 1000000,
      audioBitsPerSecond: 64000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.start(1000);
    recordingStartTime = Date.now();
    isRecording = true;
    hasRecordedClip = false;

    const btn = document.getElementById('btn-rec')!;
    btn.classList.add('recording');
    updateRecTimer();
    recTimerInterval = setInterval(updateRecTimer, 1000);
  } catch (err: unknown) {
    showToast('Recording failed: ' + (err as Error).message, true);
    cleanupRecordingStreams();
  }
}

export function stopRecording(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      isRecording = false;
      resolve(null);
      return;
    }

    mediaRecorder.onstop = () => {
      isRecording = false;
      recordingDuration = Math.round((Date.now() - recordingStartTime) / 1000);
      hasRecordedClip = true;
      if (recTimerInterval) { clearInterval(recTimerInterval); recTimerInterval = null; }

      const btn = document.getElementById('btn-rec')!;
      btn.classList.remove('recording');
      btn.innerHTML = '<span class="rec-dot"></span> ' + formatDuration(recordingDuration);

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      cleanupRecordingStreams();
      resolve(blob);
    };

    mediaRecorder.stop();
  });
}

function cleanupRecordingStreams(): void {
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
  if (captureStream) {
    captureStream.getTracks().forEach((t) => t.stop());
    captureStream = null;
  }
}

function updateRecTimer(): void {
  const elapsed = Math.round((Date.now() - recordingStartTime) / 1000);
  const btn = document.getElementById('btn-rec')!;
  btn.innerHTML = '<span class="rec-dot"></span> ' + formatDuration(elapsed);
}
