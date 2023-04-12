import React, { Context, useCallback, useContext, useEffect } from "react"
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from "@react-navigation/drawer";
import Finances from "../screens/Finances";
import Market from "../screens/Market";
import History from "../screens/History";
import { ServerTypes, UserTypes, serverContext, user } from "../../App";
import { useColorScheme } from "react-native";
import CartNavigation from "./CartNavigation";
import Cart from "../screens/Cart";
import { WHITE, BLACK, GREEN, URL } from "../constants/constants";
import Chat from "../screens/Chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from 'axios'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { View, Text, StyleSheet } from 'react-native'
import LinearGradient from "react-native-linear-gradient";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

interface Chat_Update {
  users: {
      id: string,
      messages: {
          isIncoming: boolean,
          content: string
      }[]
  }[]
}

interface storage {
  messages: {
      isIncoming: boolean,
      content: string
  }[]
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)
  const { setItem } = useAsyncStorage('userLoginData')

  function logout() {
    userData.companyName = ''
    userData.firstName = ''
    userData.lastName = ''
    userData.isAdmin = false
    userData.token = ''
    userData.setIsAuthenticated(false)
    setItem(JSON.stringify({
      didLogOut: true
    }))
  }

  const color = isDark ? WHITE : BLACK

  const gradientColors = ['transparent', color, color, color, color, 'transparent']
  const style = StyleSheet.create({
    user: {
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 15,
      marginBottom: 10
    },
    gradientBorder: {
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '100%',
      height: 1,
      opacity: .4
    }
  })

  return (
    <>
      <DrawerContentScrollView {...props}>
      <View style={style.user}>
        <View style={style.gradientBorder}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, height: 1 }}
          />
        </View>
          <Icon name="account-box" style={{color: GREEN, fontSize: 45}} />
          <Text style={{color: isDark ? WHITE : BLACK, fontSize: 15}}>{userData.firstName} {userData.lastName}</Text>
          <Text style={{color: isDark ? WHITE : BLACK, fontSize: 12, opacity: .6}}>{userData.companyName}</Text>
        </View>
        {props.state.routes.map((route, index) => {
          if (route.name !== 'Cart') {
            return (
                <DrawerItem key={index} label={route.name} onPress={() => {props.navigation.navigate(route.name)}} 
                  labelStyle = {{
                    color: props.state.index === index ? GREEN :  isDark ? WHITE : BLACK
                  }}    
                />
            )
          }
          return null
        })}
        <DrawerItem key={props.state.routes.length} label={'Logout'} onPress={logout} 
        labelStyle = {{
          color:  isDark ? WHITE : BLACK
        }} />
      </DrawerContentScrollView>
    </>
    
  )
}
  

export default function ContentNavigation(): JSX.Element {
  const isDark = useColorScheme() === "dark"

  const userData = useContext(user as Context<UserTypes>)
  const ws = useContext(serverContext as Context<ServerTypes>)

  const Drawer = createDrawerNavigator()

  const getHistory = useCallback( async () => {
    let time: string | null = null
    try {
        time = await AsyncStorage.getItem(`lastOnline_${userData.id}`)
    } catch (e: any) {
        console.log(e)
    }

    try {
        const r: AxiosResponse = await axios.get(`${URL}/chat/update/${userData.id}${time == null ? '' : `?time=${time}`}`, {
            headers: {
                Authorization: `Bearer ${userData.token}`
            }
        });

        (r.data as Chat_Update).users.forEach(u => {
            const messages = u.messages.map(m => {return {
                isIncoming: m.isIncoming,
                content: m.content
            }})
            AsyncStorage.getItem(`me_${userData.id}_with_${u.id}`)
            .then((e) => {
                const history = e == null ? '' : JSON.parse(e) as storage
                if ( history !== '' ) {
                    history.messages.push(...messages)
                    AsyncStorage.setItem(`me_${userData.id}_with_${u.id}`, JSON.stringify(history))
                } else {
                    AsyncStorage.setItem(`me_${userData.id}_with_${u.id}`, JSON.stringify({
                        messages: messages
                    } as storage))
                }
            }).catch()
        })
    } catch (e: any) {
        console.log(e)
    }
    finally {
      AsyncStorage.setItem(`lastOnline_${userData.id}`, new Date().toISOString())
    }
  }, [userData.id, AsyncStorage])

  //tymto padom ten dalsi effect by mal byt zbytocny, ak toto teda bude fungovat
  useEffect(() => {
    getHistory()
  }, [userData.id, getHistory])

  useEffect(() => {
    ws.server = new WebSocket(URL)
    AsyncStorage.setItem(`lastOnline_${userData.id}`, new Date().toISOString())
    ws.server.onopen = () => {
      const user = {type: 'USER_ID', data: userData.id};
      (ws.server as WebSocket).send(JSON.stringify(user))
    }

    return( () => {
      const logout = JSON.stringify({type: 'LOGOUT', data: userData.id})
      
      userData.id = '';
      (ws.server as WebSocket).send(logout);
      (ws.server as WebSocket).close(1000, 'Logout')
      AsyncStorage.setItem(`lastOnline_${userData.id}`, new Date().toISOString())
    })
    
  }, [])

  return (
    <Drawer.Navigator
      initialRouteName="Finances"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: GREEN
        },
        headerTintColor: WHITE,
        drawerStyle: {
          backgroundColor: isDark ? BLACK : WHITE,
        },
        headerRight: () => <CartNavigation navigation={navigation} />
      })}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Finances" component={Finances} />
      <Drawer.Screen name="Market" component={Market} />
      <Drawer.Screen name="History" component={History} />
      <Drawer.Screen name="Chat" component={Chat} />
      <Drawer.Screen name="Cart" component={Cart} />
    </Drawer.Navigator>
  )
}
