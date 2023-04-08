import React, { Context, createContext, useContext, useEffect, useRef } from "react"
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

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)

  function logout() {
    userData.companyName = ''
    userData.firstName = ''
    userData.lastName = ''
    userData.isAdmin = false
    userData.token = ''
    userData.setIsAuthenticated(false)
  }

  return (
    <>
      <DrawerContentScrollView {...props}>
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

  useEffect(() => {
    ws.server = new WebSocket(URL)
    
    ws.server.onopen = () => {
      const user = {type: 'USER_ID', data: userData.id};
      (ws.server as WebSocket).send(JSON.stringify(user))
    }

    return( () => {
      const logout = JSON.stringify({type: 'LOGOUT', data: userData.id})
      userData.id = '';
      (ws.server as WebSocket).send(logout);
      (ws.server as WebSocket).close(1000, 'Logout')
    })
    
  }, [])

  return (
    <Drawer.Navigator
      initialRouteName="Finances"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: GREEN,
          height: 55
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
      <Drawer.Screen name="Purchase History" component={History} />
      <Drawer.Screen name="Chat" component={Chat} />
      <Drawer.Screen name="Cart" component={Cart} />
    </Drawer.Navigator>
  )
}
