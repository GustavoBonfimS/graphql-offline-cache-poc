import { gql, useQuery } from "@apollo/client";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import Animated, { LinearTransition, SlideInLeft, SlideInRight } from "react-native-reanimated";
import colors from "tailwindcss/colors";

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

  function handleAddNewCharacter() {}

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.green["700"]} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-800 p-4">
      <Text className="text-2xl text-white">Personagens de Rick And Morty</Text>

      <ScrollView className="my-4">
        <View className="gap-3">
          {data?.characters?.results?.map((c, index) => (
            <Animated.View entering={SlideInLeft.delay(100 * index)} key={c.id} layout={LinearTransition}>
              <View
                className="rounded-lg p-4 bg-white w-full min-h-14 flex-row gap-4"
              >
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
        <Text className="font-bold text-green-700">Adicionar personagem</Text>
      </View>
    </View>
  );
}

export default MainPage;
