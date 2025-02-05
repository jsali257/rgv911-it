import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./authconfig";
import { connectToDB } from "./lib/utils";
import { User } from "./lib/models";
import bcrypt from "bcrypt";

const login = async (credentials) => {
  try {
    connectToDB();
    const user = await User.findOne({
      username: credentials.username,
    });

    if (!user || !user.isActive) {
      throw new Error("Invalid username or insufficient permissions");
    }

    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new Error("Invalid username or password");
    }

    return user;
  } catch (err) {
    console.log("Login error:", err);
    // Don't expose internal errors to the client
    throw new Error("Invalid username or password");
  }
};

export const { signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const user = await login(credentials);
          return user;
        } catch (err) {
          console.log("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.id = user.id;
        token.img = user.img;
        token.isAdmin = user.isAdmin;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.username = token.username;
        session.user.img = token.img;
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.department = token.department;
      }
      return session;
    },
  },
});
