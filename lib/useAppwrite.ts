import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { Models } from "react-native-appwrite";

type asyncFunction =  () => Promise<Models.Document[]>;

const useAppwrite = (fn: asyncFunction) => {
    const [data, setData] = useState<Models.Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fn();

        setData(response);

      } catch (error) {
        const message = (error as Error).message
        Alert.alert('Error', message);
      }
      finally{
        setIsLoading(false);
      }
    }

    useFocusEffect(useCallback(() => {
      fetchData();
    }, []))

    const refetch = async() => {
      await fetchData();
    }

    return {data, refetch, isLoading};
}

export default useAppwrite;