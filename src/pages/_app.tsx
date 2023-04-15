import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import Layout from "~/components/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="💯" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <>
        <Layout>
          <Toaster position="bottom-center" />
          <Component {...pageProps} />
        </Layout>
      </>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
