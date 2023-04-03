import axios, { AxiosResponse, AxiosError } from "axios"
import React, { Context, useContext, useRef, useState, forwardRef } from "react"
import { View, useColorScheme, StyleSheet, Text, Dimensions, Vibration, TextInput } from 'react-native'
import { UserTypes, user } from "../../App"
import { Input, Button, ThemeProvider, createTheme, InputProps } from "@rneui/themed"
import jwtDecode from "jwt-decode"
import { showMessage } from 'react-native-flash-message'
import { WHITE, BLACK, GREEN } from "../constants/constants"

const ForwardedInput = forwardRef<TextInput, InputProps>((props, ref) => (
    <Input {...props} ref={ref as any} />
))

export default function Login() {
    const isDark = useColorScheme() === 'dark'

    const userData = useContext(user as Context<UserTypes>)

    const loginData = useRef<{name: string, password: string}>({name: '', password: ''})
    const password = useRef<TextInput | null>(null)

    const [isLoading, setIsLoading] = useState<boolean>(false)

    function submitLogin() {
        if ( loginData.current.name.trim().length === 0 || loginData.current.password.trim().length === 0 ) {
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
                login: loginData.current.name,
                password: loginData.current.password
            }
        }).then( (r: AxiosResponse) => {
          const d = jwtDecode(r.data.data.token) as {firstName: string, lastName: string, iat: string, id: string, role: string, companyName: string}
          userData.companyName = d.companyName
          userData.firstName = d.firstName
          userData.lastName = d.lastName
          userData.id = d.id
          userData.isAdmin = d.role === 'admin user'
          userData.setIsAuthenticated(true)
        }).catch( (e: any) => {
            if (e instanceof AxiosError)
                showMessage({
                    message: e.response?.data.message,
                    type: 'danger'
                })
            if ( e.response == undefined ) 
                showMessage({
                    message: 'Network Error',
                    type: 'warning'
                })
            Vibration.vibrate(500)
        })
        .finally(() => setIsLoading(false))
    }

    const style = StyleSheet.create({
        container: {
            flex: 1
        },
        text: {
            color: isDark ? WHITE : BLACK
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
        },
        input: {color: isDark ? WHITE : BLACK}
    })

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
    

    return(
        <View style={style.container}>
            <View style={style.heading}>
                <Text style={style.headingText}>LOGIN</Text>
            </View>

            <View style={{flex: 1}}>
                <View style={style.form}>
                    <ThemeProvider theme={theme}>
                        <ForwardedInput onSubmitEditing={() => {(password.current as TextInput).focus()}} returnKeyType="next" onChangeText={ e => loginData.current.name = e} style={style.input} placeholder="Username"/>
                        <ForwardedInput onSubmitEditing={submitLogin} ref={password} onChangeText={ e => loginData.current.password = e} style={style.input} secureTextEntry placeholder="Password"/>
                        <Button disabled={isLoading} onPress={submitLogin} title={'LOGIN'}></Button>
                    </ThemeProvider>
                </View>
            </View>
        </View>
    )
}
