# ACF Club Early Access wait-list
Public page: https://earlyaccess.acf.gold/

This form uses Brevo's native **double opt-in contact endpoint**. No person is added to mailing list 38 until their email link is clicked.

- Brevo list ID: `38` (ACF Club Early Access)
- Brevo DOI email template ID: `115`
- Confirmation page: `https://earlyaccess.acf.gold/confirmed.html`
- API: `https://acf-earlyaccess-doi-api.vercel.app/api/subscribe`
- Vercel project: `acf-earlyaccess-doi-api`

## Required production setup
The project owner must add `BREVO_API_KEY` as an **encrypted/sensitive** environment variable in Vercel for the **Production** target, and then redeploy the API project. Do not commit the key to this repository or paste it into chat.

Until configured, the API deliberately returns HTTP 503 and the form tells visitors that confirmation emails cannot be sent.

The API source is stored in `api/subscribe.mjs`; update the live Vercel deployment when that source changes. The public site is served by GitHub Pages from `main`.

Privacy: The page must not submit the Brevo tracker `identify` command with `OPT_IN:true` before confirmation.