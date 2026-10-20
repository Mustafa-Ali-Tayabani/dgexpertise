/**
 * Where the site's forms (booking panel, contact form) are sent.
 * - endpoint: a Formspree form URL (https://formspree.io/f/<id>) — submissions are POSTed and emailed.
 * - Leave it empty to fall back to opening the visitor's email app, pre-filled to `email`.
 */
export const FORMS = {
  endpoint: '',
  email: 'dev@dgexpertise.ch',
};
