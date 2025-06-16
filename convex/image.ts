import { action } from "@/convex/_generated/server";
import { v } from "convex/values";
import {
  experimental_generateImage as generateImage,
  NoImageGeneratedError,
} from "ai";
import { Id } from "@/convex/_generated/dataModel";
import { getImageGenModel } from "@/lib/models";

export const generateAndStore = action({
  args: {
    prompt: v.string(),
    apiKey: v.string(),
    imageGenModel: v.string(),
  },
  handler: async (ctx, { prompt, apiKey, imageGenModel }) => {
    console.log(prompt, apiKey, imageGenModel);

    try {
      let imagesUrls: string[] = [];
      const model = getImageGenModel(imageGenModel, apiKey);

      if (!model) {
        return {
          success: false,
          message: "Image generation model not found",
        };
      }

      const { images } = await generateImage({
        model: model.model,
        prompt,
        n: 1,
        providerOptions: {
          ...(model.provider === "runware" && {
            runware: {
              steps: 8,
            },
          }),
          ...(model.provider === "openai" && {
            openai: {
              quality: "standard",
              style: "vivid",
            },
          }),
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

      return {
        success: true,
        data: { imagesUrls },
        message: "Image generated successfully",
      };
    } catch (error) {
      if (NoImageGeneratedError.isInstance(error)) {
        return {
          success: false,
          message: "No image generated",
        };
      }
      return {
        success: false,
        message: `Error generating image: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
