import { Stack } from "expo-router";

import "../global.css";
import { ApolloProvider } from "@apollo/client";
import ApolloClient from '../lib/apollo'

export { ErrorBoundary } from "expo-router";

function RootLayout() {
  return (
    <ApolloProvider client={ApolloClient}>
      <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
    </ApolloProvider>
  );
}

export default RootLayout;
