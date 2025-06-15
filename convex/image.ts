import { action } from "@/convex/_generated/server";
import { v } from "convex/values";
//@ts-expect-error
import { createRunware } from "@runware/ai-sdk-provider";
import {
  experimental_generateImage as generateImage,
  NoImageGeneratedError,
} from "ai";
import { Id } from "@/convex/_generated/dataModel";

export const generateAndStore = action({
  args: {
    prompt: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, { prompt, apiKey }) => {
    try {
      let imagesUrls: string[] = [];
      const runware = createRunware({
        apiKey,
      });

      const { images } = await generateImage({
        model: runware.image("runware:100@1", {
          maxImagesPerCall: 2,
        }),
        prompt,
        n: 2,
        providerOptions: {
          runware: {
            steps: 4,
          },
        },
        size: "1024x1024",
      });

      for (const image of images) {
        //convert the uint8Array to a blob
        const blob = new Blob([new Uint8Array(image.uint8Array)], {
          type: "image/png",
        });

        const storageId: Id<"_storage"> = await ctx.storage.store(blob);
        const url = await ctx.storage.getUrl(storageId);
        if (url) {
          imagesUrls.push(url);
        }
      }

      return imagesUrls;
    } catch (error) {
      if (NoImageGeneratedError.isInstance(error)) {
        throw new Error(error.message || "No image generated");
      }
      throw new Error(
        "Failed to generate image: " +
          (error instanceof Error ? error.message : error)
      );
    }
  },
});
