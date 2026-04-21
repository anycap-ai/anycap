import { setStored, removeStored } from './storage';
import { OAUTH_AUTHORIZE_URL } from './constants';

export async function signIn(): Promise<string | null> {
  const redirectUri = chrome.identity.getRedirectURL();
  const url = new URL(OAUTH_AUTHORIZE_URL);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('client_id', 'anycap-extension');

  try {
    const callbackUrl = await chrome.identity.launchWebAuthFlow({
      url: url.toString(),
      interactive: true,
    });
    if (!callbackUrl) return null;

    const hash = new URL(callbackUrl).hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    if (token) {
      await setStored('authToken', token);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await removeStored('authToken');
}
