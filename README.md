# Coki Search & Create

A next-generation AI search engine and creative suite featuring search grounding, pro-level image generation, and advanced conversational capabilities. Built with React, Tailwind CSS, and the Google Gemini API.

## Features

### 1. AI-Powered Search (Grounding)
*   **Model:** `gemini-2.5-flash`
*   **Functionality:** Performs real-time web searches using Google Search grounding tools.
*   **Output:** Provides a concise AI-generated summary with citation links to source websites.
*   **Voice Search:** Integrated Web Speech API for hands-free querying with instant text feedback.
*   **History:** Local storage based search history management.

### 2. Coki Create (Image Generation)
*   **Model:** `gemini-3-pro-image-preview`
*   **Functionality:** Generates high-fidelity visuals based on text prompts.
*   **Options:** Supports 1K, 2K, and 4K resolution outputs.
*   **Security:** Implements mandatory API Key selection for paid/metered usage of Pro models.

### 3. Coki Chat
*   **Model:** `gemini-3-pro-preview`
*   **Functionality:** A streaming chat interface capable of complex reasoning, coding, and creative writing.
*   **UX:** Features optimistic UI updates and markdown-style text rendering.

## Keyboard Shortcuts

Enhance your workflow with these global shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl` + `1` | Switch to **Search Mode** |
| `Ctrl` + `2` | Switch to **Create Mode** (Image) |
| `Ctrl` + `3` | Switch to **Chat Mode** |
| `Ctrl` + `S` | Toggle **Voice Input** (in Search Mode) |

## Tech Stack

*   **Frontend:** React 19
*   **Styling:** Tailwind CSS
*   **AI SDK:** `@google/genai` (v1.30.0+)
*   **Icons:** Lucide React

## Configuration

This application uses the Google GenAI SDK. It requires a valid API Key available via `process.env.API_KEY`.

For **Image Generation**, the application utilizes `window.aistudio` utilities to ensure the user selects a billed Google Cloud Project key, as `gemini-3-pro-image-preview` features may incur costs.

## Browser Support

*   **Voice Search:** Requires a browser compatible with the Web Speech API (Chrome, Edge, Safari, etc.).
*   **Layout:** Fully responsive design supporting mobile, tablet, and desktop viewports.