import { getCurrentUser } from "@/lib/appwrite";
import React, { createContext, useContext, useState, useEffect, Dispatch } from "react";
import { Models } from "react-native-appwrite";

type GlobalContextValues = {
    isLoggedIn: boolean,
    user: Models.Document | null,
    setIsLoggedIn: Dispatch<React.SetStateAction<boolean>>,
    isLoading: boolean,
    setUser: Dispatch<React.SetStateAction<Models.Document | null>>
}
const GlobalContext = createContext({} as GlobalContextValues);

export const useGlobalContext = () => {
    return useContext(GlobalContext);
}


const GlobalProvider = ({children}: {children: JSX.Element}) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<Models.Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then((res) => {
                if(res){
                    setIsLoggedIn(true);
                    setUser(res);
                }
                else{
                    setIsLoggedIn(false);
                    setUser(null);
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }, [])

    return (
        <GlobalContext.Provider
        value={{
            isLoggedIn,
            setIsLoggedIn,
            user,
            setUser,
            isLoading
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider;
