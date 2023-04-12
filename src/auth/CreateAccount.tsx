import React, { Context, useContext, useEffect, useRef, useState, forwardRef } from "react"
import { Dimensions, useColorScheme, Vibration, TextInput, ScrollView } from 'react-native'
import { View, Text, StyleSheet } from 'react-native'
import { UserTypes,user } from "../../App"
import { Input, Button, ThemeProvider, createTheme, InputProps } from "@rneui/themed"
import axios, { AxiosError, AxiosResponse } from "axios"
import SelectDropdown from "react-native-select-dropdown"
import { showMessage } from 'react-native-flash-message'
import { BLACK, WHITE, GREEN, URL } from "../constants/constants"
import jwtDecode from "jwt-decode"
import { useAsyncStorage } from "@react-native-async-storage/async-storage"

const ForwardedInput = forwardRef<TextInput, InputProps>((props, ref) => (
    <Input {...props} ref={ref as any} />
))


interface res {
    firstName: string, 
    lastName: string, 
    companyName: string,
    role: string,
    id: string,
    iat: string
}


export default function CreateAccount() {
    const isDark = useColorScheme() === 'dark'

    const userData = useContext(user as Context<UserTypes>)

    const [options, setOptions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [height, setHeight] = useState(Dimensions.get('window').height)


    const lastName = useRef<TextInput | null>(null)
    const password = useRef<TextInput | null>(null)
    const confirmPassword = useRef<TextInput | null>(null)
    const username = useRef<TextInput | null>(null)
    const accData = useRef({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        username: '',
        companyName: ''
    })

    const { setItem } = useAsyncStorage('userLoginData')

    function areValidValues(obj: any) {
        return (Object.values(obj) as string[]).every(
          (e) => e.trim().length > 0
        )
    }
    

    useEffect(() => {
        function changeHeight() {
            setHeight(Dimensions.get('window').height)
        }

        const listener = Dimensions.addEventListener('change', changeHeight)

        axios.get(`${URL}/users/register/init`)
        .then( (e: AxiosResponse) => {
            setOptions(e.data.names)
        })
        .catch( (e: AxiosError) => console.log(e.response))

        return( () => listener.remove())
    }, [])


    function handleSelectChange(item: string): void {
        accData.current.companyName = item
    }

    function submitRegister(): void {
        if ( !areValidValues(accData.current) ) {
            showMessage({
                message: 'All Fields Are Required And Must Not Be Whitespace Only',
                type: 'danger'
            })
            Vibration.vibrate(500)
            return
        }

        if ( accData.current.password !== accData.current.confirmPassword ) {
            showMessage({
                message: 'Passwords Must Match.',
                type: 'danger'
            })
            Vibration.vibrate(500)
            return
        }

        setIsLoading(true)
        axios.post(`${URL}/users/register`, {
            params: {
                firstName: accData.current.firstName,
                lastName: accData.current.lastName,
                company: accData.current.companyName,
                password: accData.current.password,
                login: accData.current.username.trim()
            }
        })
        .then( (r: AxiosResponse) => {
            const response = jwtDecode(r.data.data.token) as res
            userData.companyName = response.companyName
            userData.firstName = response.firstName
            userData.lastName = response.lastName
            userData.id = response.id
            userData.isAdmin = response.role === 'admin user'
            userData.token = r.data.data.token
            userData.setIsAuthenticated(true)
            setItem(JSON.stringify({
                didLogOut: false,
                token: r.data.data.token,
                login: accData.current.username.trimEnd(),
                password: accData.current.password
            }))
        })
        .catch( (e: any) => {
            console.log(e)
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
        .finally(() => setIsLoading(false))
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
            paddingTop: 30,
            paddingLeft: 5,
            paddingRight: 5,
            alignItems: 'center'
        },
        input: {
            color: isDark ? WHITE : BLACK
        }
    })

    const buttonStyle = {
        button: {
            backgroundColor: isDark ? BLACK : WHITE,
            width: Dimensions.get('window').width * .8,
            borderColor: isDark ? WHITE : BLACK,
            borderWidth: 1,
            borderRadius: 5
        },
        buttonText: {
            color: isDark ? WHITE : BLACK
        },
        row: {
            backgroundColor: isDark ? BLACK : WHITE
        },
        rowText: {
            color: isDark ? WHITE : BLACK
        }
    }

    const theme = createTheme({
        components: {
           Button: {
                buttonStyle: {
                    backgroundColor: GREEN,
                    width: Dimensions.get('window').width * .6,
                    alignSelf: 'center',
                    borderRadius: 5,
                    marginTop: 20
                },
                titleStyle: {
                    color: WHITE
                }
            }
        }
    })


    return(
        <ScrollView style={{maxHeight: height}}>
            <View style={style.heading}>
                <Text style={style.headingText}>SIGN UP</Text>
            </View>

            <View style={style.form}>
                <ForwardedInput returnKeyType="next" onSubmitEditing={() => (lastName.current as TextInput).focus()} onChangeText={(e) => accData.current.firstName = e} style={style.input} placeholder="First Name" />
                <ForwardedInput returnKeyType="next" onSubmitEditing={() => (password.current as TextInput).focus()} ref={lastName} onChangeText={(e) => accData.current.lastName = e} style={style.input} placeholder="Last Name" />
                <ForwardedInput returnKeyType="next" onSubmitEditing={() => (confirmPassword.current as TextInput).focus()} ref={password} onChangeText={(e) => accData.current.password = e} style={style.input} secureTextEntry placeholder="Password" />
                <ForwardedInput returnKeyType="next" onSubmitEditing={() => (username.current as TextInput).focus()} ref={confirmPassword} onChangeText={(e) => accData.current.confirmPassword = e} style={style.input} secureTextEntry placeholder="Confirm Password" />
                <ForwardedInput ref={username} onChangeText={(e) => accData.current.username = e} style={style.input} placeholder="Username" />
                <SelectDropdown data={options} onSelect={handleSelectChange} rowTextStyle={buttonStyle.rowText} rowStyle={buttonStyle.row} buttonTextStyle={buttonStyle.buttonText} buttonStyle={buttonStyle.button} defaultButtonText="Select A Company"/>
                <ThemeProvider theme={theme}>
                    <Button onPress={submitRegister} disabled={isLoading} title={'Create An Account'} />
                </ThemeProvider>
                
            </View>
        </ScrollView>
    )
}

