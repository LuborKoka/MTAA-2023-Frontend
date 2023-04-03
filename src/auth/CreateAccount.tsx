import React, { Context, useContext, useEffect, useRef, useState, forwardRef } from "react"
import { Dimensions, useColorScheme, Vibration, TextInput } from 'react-native'
import { View, Text, StyleSheet } from 'react-native'
import { UserTypes,user } from "../../App"
import { Input, Button, ThemeProvider, createTheme, InputProps } from "@rneui/themed"
import axios, { AxiosError, AxiosResponse } from "axios"
import SelectDropdown from "react-native-select-dropdown"
import { showMessage } from 'react-native-flash-message'
import { BLACK, WHITE, GREEN } from "../constants/constants"

const ForwardedInput = forwardRef<TextInput, InputProps>((props, ref) => (
    <Input {...props} ref={ref as any} />
))


export default function CreateAccount() {
    const isDark = useColorScheme() === 'dark'

    const userData = useContext(user as Context<UserTypes>)

    const [options, setOptions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

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

    function areValidValues(obj: any) {
        return (Object.values(obj) as string[]).every(
          (e) => e.trim().length > 0
        )
      }

    useEffect(() => {
        axios.get(`${URL}/users/register/init`)
        .then( (e: AxiosResponse) => {
            setOptions(e.data.names)
        })
        .catch( (e: AxiosError) => console.log(e.response))
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
                login: accData.current.username
            }
        })
        .then( () => {
            userData.setIsAuthenticated(true)
        })
        .catch( (e: any) => {
            if (e instanceof AxiosError) {
                showMessage({
                    message: e.response?.data.message,
                    type: 'danger'
                })
            }
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
        <View>
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
        </View>
    )
}

