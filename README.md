# LONMA DYNAMIC

Static website for LONMA DYNAMIC, focused on modified car cases, performance parts, automotive photography, and ECU tuning.

## Files

- `index.html` is the deployable homepage.
- `styles.css` contains the full visual system.
- `script.js` controls the case/service hover interactions.
- `assets/` contains local visual assets.

## Contact email delivery

The production Contact form uses `api/contact.js` and Resend.

Required Vercel environment variables:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL=lonmadynamic@gmail.com`
- `CONTACT_FROM_EMAIL=LONMA DYNAMIC <onboarding@resend.dev>`

`onboarding@resend.dev` can only send to the email address associated with that Resend account.
To deliver to `lonmadynamic@gmail.com`, that Gmail address must be associated with the Resend account
and API key. Otherwise,
use a verified domain sender owned by LONMA DYNAMIC. If the sender restriction is
not satisfied, Resend can return `403`; the Contact API maps that provider refusal
to `502` for the browser.

Before activating the form in Production, configure a Vercel Firewall rate-limit
rule for `POST /api/contact`: allow no more than 5 requests per minute per source,
then rate-limit requests over that threshold. The API also sends a stable
`Idempotency-Key` to Resend so a retry of the same inquiry does not create a
duplicate email.

After changing environment variables, redeploy Production. Submit one inquiry
from `/pages/contact`, confirm the inline success message, verify receipt at
`lonmadynamic@gmail.com`, and reply to confirm the customer's address is used.
Replace the testing sender after a LONMA-owned domain is verified in Resend.
