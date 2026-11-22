# Alpha Kids Parent Coach

A small bilingual parenting coach prototype for English and Urdu concerns. Built with Node.js and a simple web UI.

Live site: https://heemankv-aplha-kids.vercel.app/ (production deploys from `main`).

## Run

1. Use Node.js 20 or newer.
2. For a local model with no API key, install [Ollama](https://ollama.com/download), run `ollama pull gemma3:4b`, and start Ollama (`ollama serve` if it is not already running).
3. Copy `.env.example` to `.env`. Leave `OPENAI_API_KEY` empty to use Ollama, or set it to use OpenAI.
4. Run `npm start` and open http://localhost:3000.

The API key stays on the server. The local model uses Ollama on this computer. Conversations live only in the browser tab and are not stored in a database. Explicit emergency and abuse language is escalated before either model is called.

## Deploy on Vercel with Ollama Cloud

1. Create an [Ollama API key](https://ollama.com/settings/keys). Cloud inference uses pay-as-you-go credits; check [current pricing](https://ollama.com/pricing) before publishing.
2. Import this GitHub repository into Vercel. Its `public/` directory is the static site, and `api/coach.js` is the server function.
3. Add `OLLAMA_API_KEY` as a **server-side** Vercel environment variable. Optionally set `OLLAMA_CLOUD_MODEL` (default `gemma4:31b`). Do not add keys to `public/` or commit them.
4. Deploy. The local Ollama model is used only when neither `OLLAMA_API_KEY` nor `OPENAI_API_KEY` is set and the app runs on your computer. If both keys are set, OpenAI takes priority.
