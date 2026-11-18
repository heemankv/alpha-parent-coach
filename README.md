# Alpha Kids Parent Coach

A small bilingual parenting coach prototype for English and Urdu concerns. Built with Node.js and a simple web UI.

## Run

1. Use Node.js 20 or newer.
2. For a local model with no API key, install [Ollama](https://ollama.com/download), run `ollama pull gemma3:4b`, and start Ollama (`ollama serve` if it is not already running).
3. Copy `.env.example` to `.env`. Leave `OPENAI_API_KEY` empty to use Ollama, or set it to use OpenAI.
4. Run `npm start` and open http://localhost:3000.

The API key stays on the server. The local model uses Ollama on this computer. Conversations live only in the browser tab and are not stored in a database. Explicit emergency and abuse language is escalated before either model is called.
