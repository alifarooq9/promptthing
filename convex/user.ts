import { query } from "@/convex/_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const current = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});
