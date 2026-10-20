import { FORMS } from './forms.config';

export type SendResult = 'sent' | 'mail';

/**
 * Sends a form submission: POST to the configured endpoint, or (no endpoint) open the visitor's
 * email app pre-filled to FORMS.email. Throws if the endpoint rejects the submission.
 */
export async function sendForm(subject: string, fields: Record<string, string>, replyTo?: string): Promise<SendResult> {
  const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v && v.trim()));
  if (FORMS.endpoint) {
    const r = await fetch(FORMS.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, ...(replyTo ? { _replyto: replyTo } : {}), ...clean }),
    });
    if (!r.ok) throw new Error(`Form endpoint responded ${r.status}`);
    return 'sent';
  }
  const body = Object.entries(clean).map(([k, v]) => `${k} : ${v}`).join('\n');
  location.href = `mailto:${FORMS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return 'mail';
}
