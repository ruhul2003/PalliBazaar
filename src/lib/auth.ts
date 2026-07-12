import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { dbConnect } from "./db";
import { User, IUser } from "./models";
import { getOAuthState } from "better-auth/api";

// Ensure database connection before initializing Better Auth
await dbConnect();
const client = mongoose.connection.getClient();
const db = client.db(process.env.DB_NAME || "Palli_Bazar");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: true,
  }),
  user: {
    fields: {
      emailVerified: "isVerified",
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      profilePicture: {
        type: "string",
        required: false,
      },
      isBanned: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          let role = (user as any).role;
          try {
            const additionalData = (await getOAuthState()) as { role?: string } | null;
            if (additionalData?.role) {
              role = additionalData.role;
            }
          } catch (e) {
            // ignore: not an OAuth flow
          }
          return {
            data: {
              ...user,
              role: role || "customer",
              isVerified: true,
              isBanned: false,
            },
          };
        },
      },
    },
  },
});

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    await dbConnect();
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return null;
    }
    const user = await User.findById(session.user.id);
    if (!user || user.isBanned) {
      return null;
    }
    return user;
  } catch (err) {
    console.error("Error retrieving current user:", err);
    return null;
  }
}

export async function requireAuth(allowedRoles?: string[]): Promise<IUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
