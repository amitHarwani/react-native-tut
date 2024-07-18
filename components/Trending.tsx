import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Image,
  ViewabilityConfig,
  ViewToken,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Models } from "react-native-appwrite";
import * as Animatable from "react-native-animatable";
import { icons } from "@/constants";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

const zoomIn: Animatable.CustomAnimation  = {
  0: {
    scaleY: 0.9,
    scaleX: 0.9
  },
  1: {
    scaleY: 1.1,
    scaleX: 1.1
  },
};

const zoomOut: Animatable.CustomAnimation = {
  0: {
    scaleX: 1.1,
    scaleY: 1.1
  },
  1: {
    scaleX: 0.9,
    scaleY: 0.9
  },
};
const TrendingItem = ({
  activeItem,
  item,
}: {
  activeItem: string;
  item: Models.Document;
}) => {
  const [play, setPlay] = useState(false);

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem == item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <Video 
          source={{uri: item.video}}
          className="w-52 h-72 rounded-[35px] mt-3 bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if(status.isLoaded && status.didJustFinish){
                setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="relative justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
            className="w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};
const Trending = ({ posts }: { posts: Models.Document[] }) => {
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    if(Array.isArray(posts) && posts.length > 2){
      setActiveItem(posts[1].$id);
    }
  }, [posts])
  const viewableItemsChanged = ({viewableItems}: {viewableItems: Array<ViewToken>}) => {
    if(viewableItems.length > 0){
      setActiveItem(viewableItems[0].key);
    }
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      horizontal={true}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{itemVisiblePercentThreshold: 70}}
      contentOffset={{x: 170, y: 0}}
    />
  );
};

export default Trending;
