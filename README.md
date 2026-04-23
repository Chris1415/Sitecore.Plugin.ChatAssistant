<p>
  <img src="assets/app-logo.png" alt="Chat Assistant" width="72" height="72" style="vertical-align: middle;" />
  <strong style="font-size: 1.5em;">Chat Assistant</strong>
</p>

An AI-powered chat assistant for the **Sitecore Marketplace** and **XM Cloud**. This sample application showcases how to build editor-focused extensions with conversational AI. It is the **first app** to integrate the native **Marketer MCP** into the Vercel AI SDK stack. It brings intelligent assistance directly into the Page Builder—helping editors with content analysis, component management, brand validation, translations, and more, without leaving the editor.

Editors work with specialized agents tuned to their content type: **Sitecore** (general content), **Products**, **News**, **Events**, or **Allmighty** (full access). The assistant uses **Pages Context** to understand the current page and leverages tools such as getPageComponents, getContentItemContent, translatePage, updateComponentContent, generateBrandReviewFromContent, getPageScreenshot, and getContentAnalyticsData. Agents suggest actions, surface publishing status, run brand compliance checks, and can navigate or refresh the page after updates.

### Architecture

- **Vercel AI Gateway** — unified access to multiple LLM providers (GPT, Claude, Gemini)
- **Vercel AI SDK & Elements** — `useChat`, streaming, tool approval, custom UI parts
- **Sitecore Marketplace SDK** — `@sitecore-marketplace-sdk/client`, `@sitecore-marketplace-sdk/xmc`, `@sitecore-marketplace-sdk/ai`
- **Marketer MCP** — native Sitecore MCP tools (Brand Review, etc.) via `@ai-sdk/mcp`
- **Pages Context** — injected into agent system prompt so the LLM knows the current page, site, language, and template

Chat history is managed with summarization to avoid context-window overflow; tools use an approval flow for sensitive operations (e.g. content updates, navigation).

**Editor features:** Multi-agent chat with template-aware agent suggestions; predefined questions by content type (page context, sites & languages, translate, summarize, component updates, brand validation, analytics, screenshots); brand kit selection and section filtering for compliance reviews; model picker (GPT-5, Claude, Gemini); conversation history with summarization; tool approval flow for sensitive operations; custom UI for analytics charts, brand review cards, and page screenshots.

**Sample workflows:** Create a news page, auto-translate it, and navigate to the translated version; run a site-wide publishing/translation report; validate content against brand guidelines and get recommendations; update component content in natural language; generate a campaign from a PDF (create pages and update hero banners).

| | |
| --- | --- |
| **Version** | 0.1.0 |
| **Extension points** | Pages Context |
| **Built with** | Next.js 16, React 19, Sitecore Marketplace SDK (`@sitecore-marketplace-sdk/client`, `@sitecore-marketplace-sdk/xmc`, `@sitecore-marketplace-sdk/ai`), Vercel AI SDK, Auth0, Tailwind CSS, Radix UI |
| **Docs** | [Marketplace SDK](https://doc.sitecore.com/mp/en/developers/sdk/latest/sitecore-marketplace-sdk/sitecore-marketplace-sdk-for-javascript.html) · [Quick start — CLI (Scaffold an app)](https://doc.sitecore.com/mp/en/developers/sdk/0/sitecore-marketplace-sdk/quick-start--cli-.html#scaffold-an-app) · [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) |
| **Notable** | First app to add native Marketer MCP integration into the Vercel AI SDK underlying functionality |

## 📦 Prerequisites

- **Environment variables** — Copy [`.env.example`](./.env.example) to `.env.local` and fill in the values. Variable names and sections match what this app expects (Auth0, Sitecore org/tenant, AI Gateway, deploy credentials, and optional flags).
- **Sitecore Marketplace setup** — Install the CLI, scaffold or register your app, and connect it to the Marketplace as described in [Quick start — CLI: Scaffold an app](https://doc.sitecore.com/mp/en/developers/sdk/0/sitecore-marketplace-sdk/quick-start--cli-.html#scaffold-an-app).
- **Vercel AI Gateway key** — [Get a key](https://vercel.com/docs/ai-gateway) and set `AI_GATEWAY_API_KEY` in `.env.local` (see `.env.example`).
- **App Studio** — Create or edit your app at [portal.sitecorecloud.io/app-studio](https://portal.sitecorecloud.io/app-studio)
- **AI Skills API** — Enable the Brand Review API in App Studio under *Edit* → *API access* for brand validation; update installed apps after enabling so credentials propagate
- **Auth0** — Configure Auth0 for OAuth (see `.env.example` and App Studio)

## 📦 Running the Application Locally

You can run this application locally; note that it requires loading within the Sitecore Marketplace to enable full functionality.

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Sitecore.Plugin.ChatAssistant
   ```

2. **Configure environment**

   Copy `.env.example` to `.env.local` and set the required values. For CLI installation, scaffolding, and wiring your app to Sitecore Marketplace, follow [Quick start — CLI: Scaffold an app](https://doc.sitecore.com/mp/en/developers/sdk/0/sitecore-marketplace-sdk/quick-start--cli-.html#scaffold-an-app).

3. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

   > Use `--legacy-peer-deps` if you run into peer dependency conflicts (e.g. with React 19).

4. **Start the development server**

   ```bash
   npm run dev
   ```

   When running on **localhost**, the Sitecore Marketplace SDK does not initialize (to avoid console noise from `INVALID_ORIGIN` and handshake timeouts). The app will load and you can navigate the UI; SDK-backed features (Pages Context, tools, AI chat) require the app to be run inside the Sitecore Marketplace (XM Cloud). This is expected and documented in the client code.

## 🔗 Sitecore Integration

This application is designed to work as a **Pages Context** extension in the Sitecore Marketplace. To test it, register the app using the Pages Context extension point.

### Pages Context (Page Builder)

AI assistance at page level. The chat is aware of the current page, site, language, and template. Use predefined questions or ask freely for page details, publishing status, translations, component updates, brand validation, analytics, and screenshots. The assistant can navigate to other pages or refresh the canvas after content changes. Brand kit selection enables compliance reviews against configured brand guidelines.

The app uses the Sitecore Marketplace SDK (`@sitecore-marketplace-sdk/client`, `@sitecore-marketplace-sdk/xmc`, `@sitecore-marketplace-sdk/ai`) to communicate with XM Cloud. Page context, tool calls, and AI responses flow through the SDK; no custom fields are stored on content items—the plugin is an editor tool that operates on existing XM Cloud data.

## 🌎 Head application integration

This plugin is an **editor-only** extension. It does not store custom fields on content items that the head application reads. All operations (translations, component updates, navigation) are performed through XM Cloud; the head application should continue to consume content and publishing status through your existing XM Cloud integration (e.g. content API, GraphQL, or delivery endpoints). No changes are required in the head app to "integrate" with Chat Assistant—editors use it inside the Marketplace for analysis and actions; the head app reflects the published or draft state that XM Cloud exposes.

## 💡 Tips & Pitfalls

- **Context window** — Long conversations trigger automatic summarization (see `lib/message-history-manager.ts`). This reduces tokens and cost but adds slight latency when summarization runs.
- **Model choice** — Use `gpt-5-mini` or similar for development to save cost; switch to more capable models for production tasks. The model picker in the UI shows relative pricing.
- **Tool approval** — Sensitive tools (content updates, navigation) require user approval before execution. Ensure the UI handles approval/rejection and sends responses back via `addToolApprovalResponse`.
- **Dev mode** — AI SDK devtools are enabled in development to inspect LLM calls, tool invocations, and token usage.

## 📚 Additional Information

- **[Sitecore Marketplace and Vercel AI SDK – When 1 + 1 truly becomes more than 2](https://hachweb.wordpress.com/2026/01/25/sitecore-marketplace-and-vercel-ai-sdk-when-1-1-truly-becomes-more-than-2/)** — Deep dive into the Chat Assistant architecture: agents, tools (atomic, domain, client-trigger), Pages Context integration, predefined questions, custom visualizations (analytics charts, brand review cards), tool approval flow, summarization, and vibe coding with Cursor.
- **[SitecoreAI Marketplace – AI Skills](https://hachweb.wordpress.com/2026/03/11/sitecoreai-marketplace-ai-skills/)** — Step-by-step guide to enabling and using the AI Skills (Brand Review) API in Marketplace apps, including the `@sitecore-marketplace-sdk/ai` package and `generateBrandReview` integration.
- **[Introducing AI Skills APIs in Marketplace apps](https://developers.sitecore.com/changelog/marketplace/23022026/introducing-support-for-ai-skills-apis-in-marketplace-apps)** — Official changelog entry for the AI Skills feature.
- **[AI Brand Review Admin REST API](https://api-docs.sitecore.com/ai-skills/ai-brand-review-admin-rest-api)** — API reference for the Brand Review AI Skills API.

## Authors

<img src="assets/authors/christian-hahn-logo.png" alt="" width="40" /> **Christian Hahn** — *Technical Product Manager DevEx & SDKs @ Sitecore* · [Read More](https://www.linkedin.com/in/christian-hahn-solo/)

## 📝 License

This project is licensed under the terms specified in the LICENSE file.

## 🐛 Issues

If you encounter any issues or have suggestions for improvements, please open an issue on the repository.
