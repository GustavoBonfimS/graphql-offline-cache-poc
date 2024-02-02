import { useEffect, useState } from "react";
import { AsyncStorageWrapper, persistCache } from "apollo3-cache-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack } from "expo-router";
export { ErrorBoundary } from "expo-router";
import FlashMessage from "react-native-flash-message";
import colors from "tailwindcss/colors";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OfflineQueue from "../services/offline-queue";
import "../global.css";

function RootLayout() {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();

  useEffect(() => {
    async function init() {
      const cache = new InMemoryCache();
      await persistCache({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
      });
      setClient(
        new ApolloClient({
          cache,
          uri: "https://rickandmortyapi.com/graphql",
        })
      );
    }

    init().catch(console.error);
  }, []);

  const insets = useSafeAreaInsets();

  if (!client) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-800">
        <View className="flex-row items-center gap-3">
          <ActivityIndicator size="large" color={colors.green["700"]} />
          <Text>
            Carregando...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ApolloProvider client={client}>
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
