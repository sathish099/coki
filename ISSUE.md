**Issue: Integrate Gemma Open Source Model into Coki Browser**

**Vision:**

To evolve Coki from a browser extension into a complete AI-powered browser. This strategic initiative will leverage Google's open-source Gemma model as the foundational "underhood" AI layer, providing users with a seamless and intelligent browsing experience.

**PoC ETA:**

The Proof of Concept for this integration is targeted for completion within the next two weeks.

**Technical Plan:**

1.  **Isolate AI Services:** Create a dedicated service layer for Gemma (`gemmaService.ts`) to ensure a clean, multi-model architecture.
2.  **Initial Integration:** Replace the existing Gemini-powered chat with the new Gemma service to validate the core functionality.
3.  **Future Expansion:** Post-PoC, we will explore integrating Gemma into the search and image generation features, and develop a user-facing model selection interface.

**Assigned To:**

Jules (Software Engineer)
