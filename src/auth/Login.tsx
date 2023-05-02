import axios, { AxiosResponse, AxiosError } from "axios"
import React, { Context, useContext, useRef, useState, forwardRef, useEffect } from "react"
import { View, useColorScheme, StyleSheet, Text, Dimensions, Vibration, TextInput } from 'react-native'
import { UserTypes, user } from "../../App"
import { Input, Button, ThemeProvider, createTheme, InputProps } from "@rneui/themed"
import jwtDecode from "jwt-decode"
import { showMessage } from 'react-native-flash-message'
import { WHITE, BLACK, GREEN, URL } from "../constants/constants"
import { useAsyncStorage } from "@react-native-async-storage/async-storage"
import NetInfo from "@react-native-community/netinfo"
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TokenInformation {
    firstName: string, 
    lastName: string, 
    iat: string, 
    id: string, 
    role: string, 
    companyName: string
}


const ForwardedInput = forwardRef<TextInput, InputProps>((props, ref) => (
    <Input {...props} ref={ref as any} />
))

export default function Login() {
    const isDark = useColorScheme() === 'dark'

    const userData = useContext(user as Context<UserTypes>)

    const loginData = useRef<{name: string, password: string}>({name: '', password: ''})
    const password = useRef<TextInput | null>(null)

    const [isLoading, setIsLoading] = useState(false)

    const { getItem, setItem } = useAsyncStorage('userLoginData')

    function setUserData(token: string) {
        const d = jwtDecode(token) as TokenInformation
        userData.companyName = d.companyName
        userData.firstName = d.firstName
        userData.lastName = d.lastName
        userData.id = d.id
        userData.isAdmin = d.role === 'admin user'
        userData.token = token
        userData.setIsAuthenticated(true)
    }

    function submitLogin(login = loginData.current.name.trim(), password = loginData.current.password) {
        if ( login.length === 0 || password.length === 0 ) {
            showMessage({
                message: 'Empty Password Or Username Field',
                type: 'danger'
            })
            Vibration.vibrate(500)
            return
        }
        setIsLoading(true)
        axios.post(`${URL}/users/login`, {
            params: {
                login: login,
                password: password
            }
        }).then( (r: AxiosResponse) => {
            setItem(JSON.stringify({
                didLogOut: false,
                token: r.data.data.token
            }))
            setUserData(r.data.data.token)
        }).catch( (e: any) => {
            if ( e.response == undefined ) 
                showMessage({
                message: 'Network Error',
                type: 'warning'
                })
            else if (e instanceof AxiosError) 
                showMessage({
                message: e.response?.data.message,
                type: 'danger'
                })
            Vibration.vibrate(500)
        })
        .finally(() => 
        useEffect(() => {
            const [cartItems, setCartItems] = useState([]);
            async function loadCart() {
              try {
                const cartData = await AsyncStorage.getItem(`cart_${userData.id}`);
                if (cartData !== null) {
                  setCartItems(JSON.parse(cartData));
                } else {
                  setCartItems([]);
                  await AsyncStorage.setItem(`cart_${userData.id}`, JSON.stringify([]));
                }
              } catch (error) {
                console.log(error);
              }
            }
            loadCart();
            setIsLoading(false)
          }, []));
    }

    const theme = createTheme({
        components: {
           Button: {
                buttonStyle: {
                    backgroundColor: GREEN,
                    width: Dimensions.get('window').width * .6,
                    alignSelf: 'center',
                    borderRadius: 5
            },
                titleStyle: {
                    color: WHITE
                }
            }
        }
    })


    useEffect(() => {
        getItem()
        .then((e) => {
            if ( e == null ) return
            const data = JSON.parse(e) as {token: string, didLogOut: boolean}
            if ( data.didLogOut ) return
            setUserData(data.token)
        })
    }, [])
    

    return(
        <View style={style.container}>
            <View style={style.heading}>
                <Text style={style.headingText}>LOGIN</Text>
            </View>

            <View style={{flex: 1}}>
                <View style={style.form}>
                    <ThemeProvider theme={theme}>
                        <ForwardedInput onSubmitEditing={() => {(password.current as TextInput).focus()}} returnKeyType="next" onChangeText={ e => loginData.current.name = e} style={{color: isDark ? WHITE : BLACK}} placeholder="Username"/>
                        <ForwardedInput onSubmitEditing={() => submitLogin()} ref={password} onChangeText={ e => loginData.current.password = e} style={{color: isDark ? WHITE : BLACK}} secureTextEntry placeholder="Password"/>
                        <Button disabled={isLoading} onPress={() => submitLogin()} title={'LOGIN'}></Button>
                    </ThemeProvider>
                </View>
            </View>
        </View>
    )
}


const style = StyleSheet.create({
    container: {
        flex: 1
    },
    heading: {
        backgroundColor: GREEN,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headingText: {
        color: WHITE,
        fontSize: 25
    },
    form: {
        paddingLeft: 5,
        paddingRight: 5,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    }
})