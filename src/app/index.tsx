import { useSafeAreaInsets } from "react-native-safe-area-context";
import { gql, useQuery } from "@apollo/client";
import { faker } from "@faker-js/faker";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import Animated, {
  LinearTransition,
  SlideInLeft,
} from "react-native-reanimated";
import colors from "tailwindcss/colors";

import apolloClient from "../lib/apollo";

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
  const { data, loading } = useQuery<GetCharactersResponse>(GET_ALL_CHARACTERS);
  const insets = useSafeAreaInsets();

  function handleAddNewCharacter() {
    const actualCharacters = data?.characters.results;

    if (!actualCharacters) return;

    const newCharacter: Character = {
      id: faker.string.uuid(),
      image: "https://via.placeholder.com/120",
      name: faker.person.firstName(),
      species: "Humano",
      status: "Alive",
    };

    apolloClient.writeQuery({
      query: GET_ALL_CHARACTERS,
      data: {
        characters: {
          results: [newCharacter, ...data?.characters.results],
        },
      },
      overwrite: true,
    });
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-800">
        <ActivityIndicator size="large" color={colors.green["700"]} />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-zinc-800 p-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Text className="text-2xl text-white">Personagens de Rick And Morty</Text>

      <ScrollView className="my-4">
        <View className="gap-3">
          {data?.characters?.results?.map((c, index) => (
            <Animated.View
              entering={SlideInLeft.delay(100 * index)}
              key={c.id}
              layout={LinearTransition}
            >
              <View className="rounded-lg p-4 bg-white w-full min-h-14 flex-row gap-4">
                <Image
                  className="w-20 h-20"
                  src={c.image}
                  resizeMode="contain"
                />
                <View className="flex-1">
                  <Text className="text-xl text-black">{c.name}</Text>
                  <Text className="text-black">{c.species}</Text>
                  <Text>{c.status}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View className="py-2 px-4 bg-white border-green-400 rounded-lg shadow-sm active:opacity-70 items-center justify-center">
        <Text
          className="font-bold text-green-700"
          onPress={handleAddNewCharacter}
        >
          Adicionar personagem
        </Text>
      </View>
    </View>
  );
}

export default MainPage;
