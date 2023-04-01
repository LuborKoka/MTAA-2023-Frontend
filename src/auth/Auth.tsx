import React, { useState } from "react"
import { useColorScheme, StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native"
import Login from "./Login"
import CreateAccount from "./CreateAccount"
import { BLACK, GREEN, GREENRGB, WHITE } from "../../App"

export default function Auth() {
    const isDark = useColorScheme() === 'dark'

    const [element, setElement] = useState<boolean>(true)

    const style = StyleSheet.create({
        authContainer: {
            height: Dimensions.get('window').height,
            backgroundColor: isDark ? BLACK : WHITE
        },
        container: {
            flex: 1
        },
        navContainer: {
            flexDirection: 'row'
        },
        button: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: 60,
            margin: 1,
            borderRadius: 2,
            borderColor: `rgba(${GREENRGB}, 0.3)`,
            borderWidth: 1
        },
        buttonText: {
            color: GREEN,
            fontSize: 15,
            fontWeight: '300'
        }
    })

    return(
        <View style={style.authContainer}>
            <View style={style.container}>
                { element ? <Login /> : <CreateAccount />}
            </View>

            <View style={style.navContainer}>
                <TouchableOpacity onPress={() => {setElement(true)}} style={style.button}><Text style={style.buttonText}>Login</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => {setElement(false)}} style={style.button}><Text style={style.buttonText}>SIGN UP</Text></TouchableOpacity>
            </View>
        </View>
    )
}

