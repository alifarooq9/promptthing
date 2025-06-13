import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import GitHub from "@auth/core/providers/github";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, GitHub],
});
