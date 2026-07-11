import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { dbConnect } from "./db";
import { User, IUser } from "./models";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-palli-bazaar";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "customer" | "seller" | "admin";
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await User.findById(decoded.userId);
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
