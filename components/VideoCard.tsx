import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Models } from "react-native-appwrite";
import { icons } from "@/constants";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { useGlobalContext } from "@/context/GlobalProvider";
import { likeVideo, unlikeVideo } from "@/lib/appwrite";
const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    creator: { username, avatar },
    likedBy,
    $id
  },
  onVideoLikedOrUnliked
}: {
  video: Models.Document;
  onVideoLikedOrUnliked?(video?: Models.Document): void
}) => {
  const { user } = useGlobalContext();


  const [userLikesVideo, setUserLikesVideo] = useState(false);

  useEffect(() => {
    if (Array.isArray(likedBy)) {
      const userLikes = likedBy.find((userLiked) => userLiked == user?.$id);
      if (userLikes) {
        setUserLikesVideo(true);
      }
      else{
        setUserLikesVideo(false);
      }
    }
    else{
      setUserLikesVideo(false);
    }
  }, [likedBy])

  const [play, setPlay] = useState(false);
  

  const likeVideoHandler = async () => {
    try {
      await likeVideo($id, user?.$id || '');
      setUserLikesVideo(true);
      if(typeof onVideoLikedOrUnliked === "function"){
        onVideoLikedOrUnliked(video);
      }
    } catch (error) {
      console.log(error);
      return Alert.alert('Error', 'Failed to like video');
    }
  }

  const unlikeVideoHandler = async () => {
    try {
      await unlikeVideo($id, user?.$id || '');
      setUserLikesVideo(false);
      if(typeof onVideoLikedOrUnliked === "function"){
        onVideoLikedOrUnliked(video);
      }
    } catch (error) {
      return Alert.alert('Error', 'Failed to unlike video');
    }
  }

  return (
    <View className="flex-col px-4 mb-14">
      <View className="flex-grow gap-3 items-start flex-row">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border-secondary justify-center items-center p-0.5 border">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>

        <View className="pt-2 flex-row-reverse">
          <TouchableOpacity onPress={userLikesVideo ? unlikeVideoHandler : likeVideoHandler}>
            {
              userLikesVideo ? 
            <Image
              source={icons.likeIconChecked}
              className="w-6 h-6 "
              resizeMode="contain"
            />
              :
              <Image
              source={icons.likeIconUnchecked}
              className="w-6 h-6 "
              resizeMode="contain"
            />
            }

          </TouchableOpacity>
        </View>
      </View>
      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3 "
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if (status.isLoaded && status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
