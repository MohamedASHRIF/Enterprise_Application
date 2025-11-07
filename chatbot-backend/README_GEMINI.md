# Gemini / External LLM integration

This backend can optionally forward chat prompts to an external Gemini-like API (or any LLM HTTP endpoint).

## How to enable

Set the following environment variables for the chatbot-backend process (do NOT commit secrets):

- GEMINI_API_URL - full URL to the LLM service endpoint that accepts a JSON body. Example: https://api.example.com/v1/generate
- GEMINI_API_KEY - the Bearer API key used for authorization

If you are calling Google Generative Language (e.g. generativelanguage.googleapis.com), note:

- You can use a simple API key (starts with "AIza...") — the backend will automatically append it as a `?key=API_KEY` query parameter for Google endpoints.
- Alternatively, you can use an OAuth 2 access token (recommended for production). In that case set `GEMINI_API_KEY` to the OAuth access token value (not the short API key) or set `GEMINI_OAUTH_TOKEN` (the service will accept either). To obtain an access token locally you can run:

```powershell
gcloud auth application-default print-access-token | set-content -path -
# or capture into env var
$env:GEMINI_API_KEY = (gcloud auth application-default print-access-token)
```

The code will detect Google-style API keys and append them to the URL; for OAuth tokens it will send `Authorization: Bearer <token>`.

Example (PowerShell):

```powershell
$env:GEMINI_API_URL = "https://api.example.com/v1/generate"
$env:GEMINI_API_KEY = "YOUR_SECRET_KEY"
# then run the service
.\mvnw.cmd spring-boot:run
```

## Behavior

- If both variables are set the backend will POST `{ "prompt": "..." }` to the `GEMINI_API_URL` with an `Authorization: Bearer <GEMINI_API_KEY>` header.
- If the external call succeeds and returns a reply (common keys: `reply`, `text`, `output_text`, `response`, `result`) the backend returns that text to the frontend.
- If the external call fails or the env vars are not set, the backend falls back to the `knowledge.json` local dataset and returns an appropriate response.

## Notes

- This is a generic adapter. If your provider requires a specific request/response schema (model name, messages array, streaming, etc.), edit `KnowledgeService.callGeminiApi` to construct the correct JSON payload and extract the right fields from the response.
- Keep API keys secure — use environment variables or a secrets manager in production.
