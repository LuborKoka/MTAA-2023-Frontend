import React, { useState, createContext, useRef, useEffect } from "react"
import Auth from "./src/auth/Auth";
import FlashMessage, { showMessage } from "react-native-flash-message";
import ContentNavigation from "./src/navigation/ContentNavigation";
import { NavigationContainer } from "@react-navigation/native"
import NetInfo from '@react-native-community/netinfo'
import axios from "axios";
import { URL } from "./src/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

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


  const { setItem } = useAsyncStorage('userLoginData')

  async function fetchToken() {
    try {
      const r = await axios.get(`${URL}/`, {
        headers: {
          Authorization: `Bearer ${userData.current.token}`
        }
      })

      if ( r.status === 200 ) {
        userData.current.token = r.data.token as string
        setItem(r.data.token as string)
      }

    } catch (e: any) {
      showMessage({
        message: 'Log In Again',
        type: 'danger'
      })
    }
  }


  useEffect(() => {
    let oncePerConnectionStateChange = true
    let wasOffline = false
    
    const unsubscribe = NetInfo.addEventListener( state => {
      if ( state.isConnected && state.isInternetReachable && wasOffline && oncePerConnectionStateChange ) {
        oncePerConnectionStateChange = false
        setTimeout(() => oncePerConnectionStateChange = true, 500)
        
        fetchToken()

        setTimeout(() => showMessage({
          message: 'We Are Back Online',
          type: 'success'
        }), 500)        
      }

      if ( !state.isConnected && !state.isInternetReachable ) {
        showMessage({
          message: 'We Are Offline',
          type: 'danger'
        })
        wasOffline = true
      }
    })
    
    return( ()=> unsubscribe())
  }, [])

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



