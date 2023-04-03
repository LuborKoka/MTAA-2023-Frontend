import React, { Context, useContext } from "react"
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from "@react-navigation/drawer";
import Finances from "../screens/Finances";
import Market from "../screens/Market";
import History from "../screens/History";
import { UserTypes, user } from "../../App";
import { useColorScheme } from "react-native";
import CartNavigation from "./CartNavigation";
import Cart from "../screens/Cart";
import { View } from 'react-native'
import { WHITE, BLACK, GREEN } from "../constants/constants";


function CustomDrawerContent(props: DrawerContentComponentProps) {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)

  return (
    <>
      <View></View>
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
        <DrawerItem key={props.state.routes.length} label={'Logout'} onPress={() => {
          userData.companyName = ''
          userData.firstName = ''
          userData.lastName = ''
          userData.id = ''
          userData.isAdmin = false
          userData.token = ''
          userData.setIsAuthenticated(false)
        }} 
        labelStyle = {{
          color:  isDark ? WHITE : BLACK
        }} />
      </DrawerContentScrollView>
    </>
    
  )
}
  

export default function ContentNavigation(): JSX.Element {
  const isDark = useColorScheme() === "dark"

  const Drawer = createDrawerNavigator()

  return (
    <Drawer.Navigator
      initialRouteName="Finances"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: GREEN,
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
      <Drawer.Screen name="Cart" component={Cart} />
    </Drawer.Navigator>
  )
}
