import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string" },
        phoneNumber: { type: "string", required: false },
        profilePicture: { type: "string", required: false },
        isBanned: { type: "boolean", required: false },
      },
    }),
  ],
});
