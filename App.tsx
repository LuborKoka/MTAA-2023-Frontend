import React, { useState, createContext, useRef, useEffect } from "react"
import Auth from "./src/auth/Auth";
import FlashMessage, { showMessage } from "react-native-flash-message";
import ContentNavigation from "./src/navigation/ContentNavigation";
import { NavigationContainer } from "@react-navigation/native"
import NetInfo from '@react-native-community/netinfo'
import axios from "axios";
import { URL } from "./src/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { PermissionsAndroid } from 'react-native'
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from "@react-native-async-storage/async-storage";
//src: https://pixabay.com/sound-effects/search/messaging/
import Sound from 'react-native-sound'

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

interface storage {
  messages: {
      isIncoming: boolean,
      content: string
  }[]
}

export const user = createContext<UserTypes | null>(null)
export const serverContext = createContext<ServerTypes | null>(null)


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

  const audio = useRef(new Sound('new_message.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('Failed to load the sound', error)
      return
    }
  }))


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

  useEffect(() => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      audio.current.play()
      setTimeout(() => audio.current.stop(), 1000)
    })
  
    return(() => unsubscribe())
  }, [])

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



async function setMessageWithAnotherUser(from: string, to: string, content: string, myID: string) {
  const isIncoming = myID === to
  try {
      const d = await AsyncStorage.getItem(`me_${myID}_with_${isIncoming ? from : to}`)
      if ( d !== null ) {
          const data = JSON.parse(d) as storage
          data.messages.push({isIncoming: isIncoming, content: content})
          AsyncStorage.setItem(`me_${myID}_with_${isIncoming ? from : to}`, JSON.stringify(data))
      } else {
          const data: storage = {messages: [{isIncoming: isIncoming, content: content}]}
          AsyncStorage.setItem(`me_${myID}_with_${isIncoming ? from : to}`, JSON.stringify(data))
      }

  } catch(e: any) {
      console.log(e)
      console.log('Error in storing the received message')
  }
}

