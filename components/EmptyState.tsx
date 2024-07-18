import { View, Text, Image } from "react-native";
import React from "react";
import { images } from "@/constants";
import CustomButton from "./CustomButton";
import { router } from "expo-router";

type EmptyStateProps = {
  title: string;
  subtitle: string;
  buttonAction?: "create" | "explore";
};
const EmptyState = ({
  title,
  subtitle,
  buttonAction = "create",
}: EmptyStateProps) => {
  return (
    <View className="justify-center items-center px-4">
      <Image
        source={images.empty}
        className="w-[270px] h-[215px]"
        resizeMode="contain"
      />
      <Text className="text-xl text-center font-psemibold text-white mt-2">
        {title}
      </Text>

      <Text className="font-pmedium text-sm text-gray-100">{subtitle}</Text>

      <CustomButton
        title={buttonAction === "create" ? "Create video" : "Explore"}
        handlePress={() => {
          if (buttonAction === "create") {
            router.push("/create");
          } else if (buttonAction === "explore") {
            router.push("/home");
          }
        }}
        containerStyles="w-full my-5"
      />
    </View>
  );
};

export default EmptyState;
