import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Requires setting up alias or relative path
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
import { hash, verify } from "@node-rs/argon2";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema
  }),
  emailAndPassword: {
    enabled: true,
    async hashPassword(password: string) {
      return await hash(password);
    },
    async verifyPassword(hashed: string, password: string) {
      return await verify(hashed, password);
    }
  },
  plugins: [
    nextCookies() // Required for next.js app router
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "VIEWER"
      },
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true
      }
    }
  }
});
