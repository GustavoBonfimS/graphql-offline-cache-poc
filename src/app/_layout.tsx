import { Stack } from "expo-router";
import FlashMessage from 'react-native-flash-message'

import "../global.css";
import { ApolloProvider } from "@apollo/client";
import ApolloClient from '../lib/apollo'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OfflineQueue from "../services/offline-queue";

export { ErrorBoundary } from "expo-router";

function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <ApolloProvider client={ApolloClient}>
      <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
     <FlashMessage statusBarHeight={insets.top} floating />
     <OfflineQueue />
    </ApolloProvider>
  );
}

export default RootLayout;
