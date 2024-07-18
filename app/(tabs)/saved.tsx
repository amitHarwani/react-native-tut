import EmptyState from "@/components/EmptyState";
import SearchInput from "@/components/SearchInput";
import VideoCard from "@/components/VideoCard";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getLikedVideosByUser, searchPosts } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View
} from "react-native";
import { Models } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

const Saved = () => {

  const {query} = useLocalSearchParams();

  const {user} = useGlobalContext();

  const {
    data: likedPosts,
    refetch
  } = useAppwrite(() => getLikedVideosByUser(user?.$id || ''));


  const [queryFilteredPosts, setQueryFilteredPosts] = useState<Models.Document[]>([]);

  const onVideoLikedOrUnliked = () => {
    refetch()
  }

  useEffect(() => {
    if(query && Array.isArray(likedPosts) && likedPosts.length){
      const filtered = likedPosts.filter((post) => post.title.includes(query));
      setQueryFilteredPosts(filtered);
    }
    else{
      setQueryFilteredPosts([]);
    }
  }, [query, likedPosts])

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={query ? queryFilteredPosts : likedPosts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} onVideoLikedOrUnliked={onVideoLikedOrUnliked} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="text-2xl font-psemibold text-white">Saved Videos</Text>
            <View className="mt-6 mb-8">
              <SearchInput
                placeholder="Search your saved videos"
                redirectionRoute="/saved"
                initialQuery={query as string || ''}
                isQueryRequired={false}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title={`No Liked Videos ${query ? 'for this query': ''}`}
            subtitle="Explore to like a video"
            buttonAction="explore"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Saved;
