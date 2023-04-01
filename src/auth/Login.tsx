import axios, { AxiosResponse, AxiosError } from "axios"
import React, { Context, useContext, useRef, useState } from "react"
import { View, useColorScheme, StyleSheet, Text, Dimensions } from 'react-native'
import { BLACK, GREEN, URL, UserTypes, WHITE, user } from "../../App"
import { Input, Button, ThemeProvider, createTheme } from "@rneui/themed"
import jwtDecode from "jwt-decode"
import { showMessage } from 'react-native-flash-message'

export default function Login() {
    const isDark = useColorScheme() === 'dark'

    const userData = useContext(user as Context<UserTypes>)

    const loginData = useRef<{name: string, password: string}>({name: '', password: ''})

    const [isLoading, setIsLoading] = useState<boolean>(false)

    function submitLogin() {
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
            fontSize: 20
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
                        <Input onChangeText={ e => loginData.current.name = e} style={style.input} placeholder="Username"/>
                        <Input onChangeText={ e => loginData.current.password = e} style={style.input} secureTextEntry placeholder="Password"/>
                        <Button disabled={isLoading} onPress={submitLogin} title={'LOGIN'}></Button>
                    </ThemeProvider>
                </View>
            </View>
        </View>
    )
}
