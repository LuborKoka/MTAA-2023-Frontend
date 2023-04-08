import React, { useState, createContext, useRef } from "react"
import Auth from "./src/auth/Auth";
import FlashMessage from "react-native-flash-message";
import ContentNavigation from "./src/navigation/ContentNavigation";
import { NavigationContainer } from "@react-navigation/native"

export interface ServerTypes {
  server: WebSocket | null
}

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
export const serverContext = createContext<ServerTypes | null>(null)


function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const server = useRef<ServerTypes | null>({server: null})
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
    <serverContext.Provider value={server.current}>
      <user.Provider value={userData.current}>
        { !isAuthenticated ? <Auth /> :
          <NavigationContainer>
              <ContentNavigation />
          </NavigationContainer> 
        }

        <FlashMessage position={'top'} duration={2500} style={{alignItems: 'center', justifyContent: 'center'}} />
      </user.Provider>
    </serverContext.Provider>    
  )
}

export default App



