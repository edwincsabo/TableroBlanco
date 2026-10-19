# Summarize and propose tasks with AI

[Español](IA.es.md) · **English** · [简体中文](AI.zh-CN.md)

Available in TableroBlanco 1.4.0 for Windows. The assistant summarizes selected text, proposes tasks and identifies open questions. AI is optional and disabled by default. Drawing, saving, templates and the other tools still work without configuring a provider.

## Configure a provider

1. Open **Settings → Optional artificial intelligence** in the library, or **Summarize and propose tasks → Configure AI** in the editor.
2. Choose **OpenAI**, **OpenRouter** or **Claude (Anthropic)**.
3. Enter a text model ID available in your account that supports structured JSON responses. Initial IDs are editable examples, not guaranteed access: `gpt-4.1-mini`, `openai/gpt-4.1-mini` and `claude-haiku-5-5`, respectively.
4. Paste the provider API key, check **Enable optional AI**, then click **Save AI settings**.

Saving settings does not make requests or validate the key with the provider. Authentication, model access and permissions are checked when you run an analysis. You need API access and any balance or billing required by your provider. The app does not include credits or guarantee that a chat subscription includes API usage.

Each provider can have its own saved model and key. Only the active provider is used. Switching requires saving settings and reviewing a new preview before sending content.

## Create a proposal

1. Select the sticky notes, shapes with text or text objects to analyze. Selecting a note's shape includes its bound text.
2. Click **Summarize and propose tasks** in the bottom toolbar.
3. Review the texts, provider and model shown. Other board content is not added automatically.
4. Click **Send and analyze**. Output is requested in the current interface language: Spanish, English or Simplified Chinese.
5. Review and edit the summary, tasks and questions. Uncheck tasks you do not want to include.
6. Click **Insert as new cards**, or **Discard proposal**.

Inserted cards are editable canvas objects. Original notes are preserved. The response does not modify the board until you insert it. Tasks are not executed, people are not assigned, and messages are not sent to third parties.

Tasks distinguish **Action mentioned in notes** from **AI suggestion** and reference the temporary source-text IDs shown in the preview. These references help review the proposal but do not prove the interpretation is correct. Check people, dates and commitments in particular: AI can make mistakes or propose something you have not decided.

## What is sent and stored

Requests include selected text, temporary IDs such as `n1`, summarization instructions and the output schema. Board names, thumbnails, images, PDFs, drawings, history, file paths and unselected text are not sent automatically. There is no OCR or browsing of links in notes.

The key is used to authenticate the request, not as model input. Requests run in the main process against fixed provider endpoints. Custom servers and authentication redirects are not accepted.

Keys are encrypted using Electron safeStorage and Windows protection for the current user, then saved in `ai-settings.json` in the app profile. They are outside the library, exports and board backups, are not displayed again, and must be configured separately on another computer. This encryption does not protect against malicious apps running as the same Windows user.

The assistant does not create a local query history. If inserted, the result becomes board content and follows its normal saving and backup behavior, including your synchronized folder if configured. Providers determine processing and retention of sent content. OpenRouter may route the request to another model provider. OpenAI requests use `store: false`; this does not guarantee zero retention.

## Limits and errors

- Between 1 and 60 text objects, up to 6,000 characters each and 20,000 total. Longer selections are rejected rather than silently shortened.
- Up to 12 tasks and eight questions. Responses are validated before display.
- A 60-second timeout. Cancel the analysis or close the assistant to request cancellation.
- One request per analysis, with no automatic retries. Cancellation cannot guarantee a provider stops processing or billing a request already received.

Invalid keys, unavailable or incompatible models, usage limits, network errors and invalid responses show a notice without inserting content. Saved settings do not guarantee every provider model is compatible.

## Disable AI or remove a key

Use **Disable AI** to keep the encrypted key while preventing new analyses. Use **Remove saved key** to remove that provider's credential from this computer; if active, AI is disabled. Removing it here does not revoke the key in the provider account; revoke it there too if needed.

## Implementation references

- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).
- [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs).
- [Claude structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).
- [Electron safeStorage and Windows encryption boundaries](https://www.electronjs.org/docs/latest/api/safe-storage).

[Back to the English README](README.en.md)
