# Abid's Web Studio — Chatbot Worker

This directory contains the Cloudflare Workers implementation of the chatbot API, migrated from the existing Vercel `api/chat.js`.

## Endpoint

- Method: `POST`
- Path: `/api/chat`
- Content-Type: `application/json`

Request:

```json
{ "message": "I need a business website." }
```

Successful response:

```json
{ "reply": "..." }
```

## Runtime and provider

- Cloudflare Worker: `test0001-chat-api`
- Model: Google Gemini 2.5 Flash
- API key header: `x-goog-api-key`
- Required secret: `GEMINI_API_KEY`

The API key must be configured as a Cloudflare secret. Do not put it in source code, `wrangler.toml`, a URL, or GitHub.

## Configure the secret

From this directory, use Wrangler:

```bash
npx wrangler secret put GEMINI_API_KEY
```

Or use the Cloudflare dashboard:

Workers & Pages → `test0001-chat-api` → Settings → Variables and Secrets → Add secret.

Enter the key directly into Cloudflare's secret field. Never paste it into a chat message or commit it to the repository.

## Deploy

From this directory, after reviewing the files and receiving deployment approval:

```bash
npx wrangler deploy
```

This configuration targets only the `test0001-chat-api` Worker. Do not change the original `test0001` Worker.

## Allowed website origins

The Worker accepts browser requests from these existing website origins:

- `https://test0001-tau.vercel.app`
- `https://test0001-abid-s-studio.vercel.app`
- `https://abidemon0242.github.io`

Requests with a different Origin are rejected with HTTP 403. Requests without an Origin header can be used for server-to-server or command-line testing. CORS is not authentication.

If the website's actual origin changes, review and explicitly update the allowlist before deploying.

## Basic tests

Replace the URL below with the Worker URL if it changes.

OPTIONS preflight from an allowed origin:

```bash
curl -i -X OPTIONS "https://test0001-chat-api.abidemon0242.workers.dev/api/chat" \
  -H "Origin: https://test0001-tau.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

A valid Gemini request (requires the Cloudflare secret):

```bash
curl -i -X POST "https://test0001-chat-api.abidemon0242.workers.dev/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"What website services do you offer?"}'
```

Unauthorized Origin:

```bash
curl -i -X POST "https://test0001-chat-api.abidemon0242.workers.dev/api/chat" \
  -H "Origin: https://example.com" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}'
```

Expected status for the unauthorized Origin is `403`.

Other validation checks should cover GET (405), invalid JSON (400), empty message (400), oversized request/message (413), unsupported content type (415), and missing secret (503). Record actual results; do not mark a test as passed unless it was run.
