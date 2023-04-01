import React from "react"
import { createDrawerNavigator } from "@react-navigation/drawer"
import Finances from "./screens/Finances"
import Market from "./screens/Market"
import History from "./screens/History"
import { GREEN, WHITE } from "../App"



export default function ContentNavigation(): JSX.Element {
    const Drawer = createDrawerNavigator()

    return(
        <Drawer.Navigator 
            initialRouteName="Finances"
            screenOptions={{
                headerStyle: {
                    backgroundColor: GREEN
                },
                headerTintColor: WHITE
            }} >
            <Drawer.Screen name="Finances" component={Finances} />
            <Drawer.Screen name="Market" component={Market} />
            <Drawer.Screen name="History" component={History} />
        </Drawer.Navigator>
            
    )
}