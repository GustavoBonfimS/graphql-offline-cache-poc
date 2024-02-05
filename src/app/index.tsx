import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { gql, useQuery } from "@apollo/client";
import { faker } from "@faker-js/faker";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  LinearTransition,
  SlideInLeft,
  SlideOutRight,
} from "react-native-reanimated";
import colors from "tailwindcss/colors";
import { useNetInfo } from "@react-native-community/netinfo";
import { addJob } from "../services/offline-queue";

const GET_ALL_CHARACTERS = gql`
  query getAllCharacters {
    characters {
      results {
        id
        image
        name
        species
        status
      }
    }
  }
`;

type Character = {
  id: string;
  name: string;
  species: string;
  image: string;
  status: string;
};

type GetCharactersResponse = {
  characters: {
    results: Character[];
  };
};

function MainPage() {
  const { data, loading, client } =
    useQuery<GetCharactersResponse>(GET_ALL_CHARACTERS);
  const insets = useSafeAreaInsets();

  const { isConnected } = useNetInfo();

  function handleAddNewCharacter() {
    if (isConnected === false) {
      addJob({
        request: {
          method: "GET",
          url: "https://example.com",
          body: {
            foo: "testing",
          },
        },
      });
      const actualCharacters = client.readQuery<GetCharactersResponse>({
        query: GET_ALL_CHARACTERS,
      });

      if (!actualCharacters) return;

      client.cache.updateQuery<GetCharactersResponse>(
        {
          query: GET_ALL_CHARACTERS,
          overwrite: true,
        },
        (data) => {
          const newCharacter: Character = {
            id: faker.string.uuid(),
            image: faker.image.url(),
            name: faker.person.firstName(),
            species: "Humano",
            status: "Alive",
          };

          if (!data?.characters?.results) {
            return {
              characters: {
                results: [newCharacter],
              },
            };
          }

          return {
            characters: {
              results: [newCharacter, ...data.characters.results],
            },
          };
        }
      );
    }
  }

  function handleRemoveCharacter(id: string) {
    client.cache.updateQuery<GetCharactersResponse>(
      {
        query: GET_ALL_CHARACTERS,
        overwrite: true,
      },
      (data) => {
        if (!data?.characters?.results) return data;

        const allCharacters = [...data.characters.results];
        const characterIndex = allCharacters.findIndex(
          (item) => item.id === id
        );

        if (characterIndex < 0) return data;

        allCharacters.splice(characterIndex, 1);
        return {
          characters: {
            results: [...allCharacters],
          },
        };
      }
    );
  }

  if (loading) {
    <View className="flex-1 items-center justify-center bg-zinc-800">
      <View className="flex-row items-center gap-3">
        <ActivityIndicator size="large" color={colors.green["700"]} />
        <Text className="text-white">Carregando personagens...</Text>
      </View>
    </View>;
  }

  return (
    <View
      className="flex-1 bg-zinc-800"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 bg-zinc-800 p-4 container mx-auto">
        <Text className="text-2xl text-white">
          Personagens de Rick And Morty
        </Text>

        <ScrollView className="my-4">
          <View className="gap-3">
            {data?.characters?.results?.map((c, index) => (
              <Animated.View
                entering={SlideInLeft.delay(100 * index)}
                exiting={SlideOutRight}
                key={c.id}
                layout={LinearTransition.delay(300)}
              >
                <Pressable
                  className="rounded-lg p-4 bg-white w-full min-h-14 flex-row gap-4"
                  onLongPress={() => handleRemoveCharacter(c.id)}
                >
                  <Image
                    source={c.image}
                    alt="character image"
                    style={{
                      width: 80,
                      height: 80,
                    }}
                  />
                  <View className="flex-1">
                    <Text className="text-xl text-black">{c.name}</Text>
                    <Text className="text-black">{c.species}</Text>
                    <Text>{c.status}</Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        <View className="gap-3">
          <Pressable
            className="py-2 px-4 bg-white border-green-400 rounded-lg shadow-sm active:opacity-70 items-center justify-center"
            onPress={handleAddNewCharacter}
          >
            <Text className="font-bold text-green-700">
              Adicionar personagem
            </Text>
          </Pressable>
          <Pressable
            className="py-2 px-4 bg-white border-red-400 rounded-lg shadow-sm active:opacity-70 items-center justify-center"
            onPress={() => client.cache.reset()}
          >
            <Text className="font-bold text-red-700">Limpar cache</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default MainPage;
