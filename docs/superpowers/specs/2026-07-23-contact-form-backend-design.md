# Contact Form Backend Design

Date: 2026-07-23
Status: Approved direction, pending implementation review

## Goal

Replace the current `mailto:` contact workflow with a real same-site form
submission that sends each inquiry to `lonmadynamic@gmail.com` through a Vercel
Function and Resend.

The existing Contact page layout, typography, bilingual content, and navigation
must remain unchanged.

## Architecture

### Browser

The existing form posts JSON to `POST /api/contact`.

While the request is running:

- the submit button is disabled;
- the status region announces progress;
- a second submit is ignored.

On success, the form is reset and a bilingual success message is shown. On
failure, the form remains populated and a bilingual retry message is shown.
The form never opens the visitor's local email application.

### Vercel Function

`api/contact.js` owns the server-side workflow:

1. Accept `POST` requests only.
2. Parse and normalize the submitted values.
3. Silently accept the hidden honeypot field when it is filled.
4. Validate required fields, email format, allowed service values, and maximum
   lengths.
5. Escape all customer-controlled content before building email HTML.
6. Send both plain-text and HTML versions through the Resend HTTP API.
7. Set the customer's email as `reply_to`.
8. Return small JSON responses with stable status codes.

The endpoint has no database and stores no customer information.

## Configuration

Production uses three Vercel environment variables:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL=lonmadynamic@gmail.com`
- `CONTACT_FROM_EMAIL=LONMA DYNAMIC <onboarding@resend.dev>`

The Resend testing sender is temporary. After LONMA controls a verified domain,
only `CONTACT_FROM_EMAIL` changes; no code change is required.

Secrets and the recipient address are not embedded in client-side files.

## Validation And Abuse Protection

- Name: required, 2-100 characters.
- Email: required, normalized, basic email validation, maximum 254 characters.
- Vehicle: required, 2-120 characters.
- Service: required and restricted to the six existing service values.
- Message: required, 10-3000 characters.
- Hidden `company` honeypot: visually absent and ignored by assistive
  technology.
- The browser disables repeat submissions until the current request finishes.
- The API rejects oversized request bodies before sending email.

Persistent rate limiting is intentionally excluded from this first release. It
can be added later with Vercel Firewall or a durable store if spam appears.

## Responses

- `200`: inquiry accepted and sent.
- `400`: malformed or invalid submission.
- `405`: unsupported request method.
- `413`: request body too large.
- `500`: server configuration is missing.
- `502`: Resend rejected or failed to deliver the request.

The browser maps these outcomes to English or Chinese messages using the
currently selected site language.

## Testing

Tests will be written before production code and will cover:

- the Contact page exposes the endpoint, honeypot, and accessible status region;
- the old `mailto:` submission is removed;
- client submission sends the visible form values and handles pending, success,
  and failure states;
- server validation rejects bad input and accepts the six service values;
- customer content is escaped in generated HTML;
- the Resend request uses environment configuration and sets `reply_to`;
- missing configuration and provider errors return stable responses;
- the complete existing test suite remains green.

After automated tests pass, the Contact page will be checked at desktop and
mobile widths. A production delivery test is performed only after the Resend
integration and Vercel environment variables are configured.

## Out Of Scope

- CRM or database storage
- customer accounts
- file uploads
- newsletter subscription
- automatic customer confirmation emails
- persistent rate limiting
- changing the Contact page visual design
