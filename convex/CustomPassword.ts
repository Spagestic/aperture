// convex/CustomPassword.ts
import { Password } from "@convex-dev/auth/providers/Password";

export const CustomPassword = Password({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
});
