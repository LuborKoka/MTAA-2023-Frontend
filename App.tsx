import React, { useState, createContext, useRef } from "react"
import { StyleSheet } from "react-native";
import Auth from "./src/auth/Auth";
import FlashMessage from "react-native-flash-message";
import ContentNavigation from "./src/navigation/ContentNavigation";
import { NavigationContainer } from "@react-navigation/native";

export const URL = 'http://192.168.100.22:4001'
export const BLACK = '#202020'
export const WHITE = '#FAFAFA'
export const GREEN = '#549E3F'
export const GREENRGB = '84, 147, 63'
export const RED = '#F00F00'

export interface UserTypes {
  token: string,
  companyName: string,
  firstName: string,
  lastName: string, 
  id: string,
  isAdmin: boolean,
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

export const user = createContext<UserTypes | null>(null)


function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const userData = useRef<UserTypes>({
    token: '',
    firstName: '',
    lastName: '',
    companyName: '',
    id: '',
    isAdmin: false,
    setIsAuthenticated: setIsAuthenticated
  })

  return(
    <user.Provider value={userData.current}>
      { !isAuthenticated ? <Auth /> :
        <NavigationContainer>
            <ContentNavigation />
        </NavigationContainer> 
  }

      <FlashMessage position={'top'} duration={2500} style={{alignItems: 'center', justifyContent: 'center'}} />
    </user.Provider>
    
  )
}

export default App



