import type { AppContext, AppProps } from "next/app";
import type { NextPageContext } from "next";
import type { AxiosInstance } from "axios";
import "../styles/globals.css";
import buildClient from "@/api/build-client";
import Header from "@/components/header";

interface UserPayload {
  id: string;
  email: string;
}

interface Props {
  currentUser: UserPayload | null;
}

// Extend Next's context type so child pages accept client & currentUser cleanly
export interface CustomPageContext extends NextPageContext {
  client?: AxiosInstance;
  currentUser?: UserPayload | null;
}

export default function AppComponent({
  Component,
  pageProps,
  currentUser,
}: AppProps & Props) {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} currentUser={currentUser} />
    </div>
  );
}

AppComponent.getInitialProps = async (appContext: AppContext) => {
  let currentUser: UserPayload | null = null;
  const client = buildClient(appContext.ctx);

  try {
    const { data } = await client.get("/api/users/currentuser");
    currentUser = data.currentUser ?? null;
  } catch {
    currentUser = null;
  }

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // Pass the already-resolved `currentUser` variable instead of `data.currentuser`
    pageProps = await (appContext.Component.getInitialProps as any)(
      appContext.ctx,
      client,
      currentUser
    );
  }

  return { pageProps, currentUser };
};
