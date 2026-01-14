# Image Generation with Vercel AI SDK - Implementation Guide

## Overview
To enable image generation and display in your chat interface, you need to make changes in several areas:

## 1. Create Image Generation Tool ✅
The tool has been created at `components/agents/tools/ImageGeneration.ts`

## 2. Add Tool to Agent
Add the image generation tool to your agent's tools:

```typescript
// In components/agents/SitecoreAgent.ts (or AllmightyAgent.ts)
import { generateImageTool } from "./tools/ImageGeneration";

function createSitecoreTools(contextId: string, accessToken: string) {
  return {
    getLanguages: getLanguagesTool(accessToken, contextId),
    getSites: getSitesTool(accessToken, contextId),
    translatePage: translatePageTool(accessToken),
    generateImage: generateImageTool(), // Add this
  };
}
```

## 3. Update Agent to Handle Image Parts
The agent needs to convert tool results containing images into image parts. You'll need to modify the agent's response handling:

```typescript
// In your agent creation, add custom response handling
import { generateImagePart } from "ai";

// In the agent's onFinish or response handler:
onFinish: async (event) => {
  // Check if any tool results contain images
  const imageResults = event.steps
    .flatMap(step => step.toolResults || [])
    .filter(result => result.imageUrl || result.imageBase64);
  
  // Convert to image parts if needed
  // Note: This might require custom agent implementation
}
```

**Important**: ToolLoopAgent doesn't automatically convert tool results to image parts. You have two options:

### Option A: Custom Agent Response (Recommended)
Modify the agent to include image parts in the response when image generation tools are used.

### Option B: Use generateImagePart in Tool Response
Have the tool return a special format that the UI can detect and render.

## 4. Update UI to Render Image Parts
Update `components/chat-interface.tsx` to handle image parts:

```typescript
// In the message rendering section (around line 1022)
{parts.map((part, i) => {
  switch (part.type) {
    case "text":
      return (
        <MessageResponse key={`${role}-${i}`}>
          {part.text}
        </MessageResponse>
      );
    case "image":
      // Handle image parts
      return (
        <div key={`${role}-${i}`} className="my-2">
          <img
            src={part.url || part.base64}
            alt="Generated image"
            className="max-w-full rounded-lg"
          />
        </div>
      );
    // Handle tool results that contain images
    default:
      // Check if part contains image data
      const partAny = part as any;
      if (partAny.imageUrl || partAny.imageBase64) {
        return (
          <div key={`${role}-${i}`} className="my-2">
            <img
              src={partAny.imageUrl || `data:image/png;base64,${partAny.imageBase64}`}
              alt="Generated image"
              className="max-w-full rounded-lg"
            />
          </div>
        );
      }
      return null;
  }
})}
```

## 5. Install Required Packages
Make sure you have the latest AI SDK version:

```bash
npm install ai@latest
```

## 6. Environment Variables
Add your image generation API keys:

```env
OPENAI_API_KEY=your_key_here  # For DALL-E
# Or other provider keys as needed
```

## 7. Alternative: Direct Image Generation in API Route
If the agent approach is complex, you can generate images directly in the API route:

```typescript
// In app/api/chat/route.ts
import { experimental_generateImage as generateImage, generateImagePart } from "ai";
import { gateway } from "ai";

// In your POST handler, check for image generation requests
if (requestBody.generateImage) {
  const imageModel = gateway("openai/dall-e-3");
  const result = await generateImage({
    model: imageModel,
    prompt: requestBody.prompt,
  });
  
  // Return image part in response
  return new Response(
    JSON.stringify({
      parts: [generateImagePart(result.imageUrl || result.imageBase64)],
    })
  );
}
```

## Challenges & Solutions

### Challenge 1: ToolLoopAgent doesn't natively support image parts
**Solution**: You may need to:
- Use a custom agent implementation
- Or handle image rendering in the UI based on tool results
- Or use `generateImagePart` to create parts manually

### Challenge 2: Streaming image responses
**Solution**: Images are typically returned after generation completes, so streaming might not apply. Return images as complete parts.

### Challenge 3: Image format handling
**Solution**: Support both URLs and base64 encoded images in the UI rendering.

## Recommended Approach

1. **Add the tool** to your agent ✅
2. **Update UI** to detect and render images from tool results
3. **Test** with a simple prompt like "generate an image of a sunset"
4. **Enhance** with proper error handling and loading states

The simplest implementation is to have the tool return image data, and the UI detects and renders it from tool results, even if it's not a native "image" part type.

