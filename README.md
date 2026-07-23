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

After changing environment variables, redeploy Production. Submit one inquiry
from `/pages/contact`, confirm the inline success message, verify receipt at
`lonmadynamic@gmail.com`, and reply to confirm the customer's address is used.
Replace the testing sender after a LONMA-owned domain is verified in Resend.
