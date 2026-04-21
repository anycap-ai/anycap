import { API_BASE } from './constants';
import { getStored } from './storage';

export type DriveSaveResult = {
  nodeId: string;
  objectUrl: string;
};

export async function saveToDrive(resultUrl: string): Promise<DriveSaveResult> {
  const token = await getStored('authToken');
  if (!token) {
    throw new Error('Sign in required to save to Drive');
  }

  // 1. Fetch the generated image
  const imageRes = await fetch(resultUrl);
  if (!imageRes.ok) {
    throw new Error(`Failed to fetch image: ${imageRes.status}`);
  }
  const blob = await imageRes.blob();

  const name = `anycap-${Date.now()}.${extensionFromMime(blob.type) || 'png'}`;

  // 2. Presign upload
  const presignRes = await fetch(`${API_BASE}/v1/drive/files/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      content_type: blob.type || 'image/png',
      content_length: blob.size,
    }),
  });

  if (!presignRes.ok) {
    const err: any = new Error(`Presign failed: ${presignRes.status}`);
    err.status = presignRes.status;
    throw err;
  }

  const presign = (await presignRes.json()).data;

  // 3. Upload blob to presigned URL
  const uploadRes = await fetch(presign.upload_url, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': blob.type || 'image/png',
    },
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.status}`);
  }

  // 4. Complete upload
  const completeRes = await fetch(`${API_BASE}/v1/drive/files/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      upload_session_id: presign.upload_session_id,
      file_id: presign.file_id,
    }),
  });

  if (!completeRes.ok) {
    const err: any = new Error(`Complete failed: ${completeRes.status}`);
    err.status = completeRes.status;
    throw err;
  }

  return {
    nodeId: presign.file_id,
    objectUrl: presign.object_url,
  };
}

function extensionFromMime(mime: string): string | null {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  };
  return map[mime] || null;
}
