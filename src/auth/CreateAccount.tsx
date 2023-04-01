import React, { Context, useContext, useEffect, useRef, useState } from "react"
import { Dimensions, useColorScheme } from 'react-native'
import { View, Text, StyleSheet } from 'react-native'
import { BLACK, GREEN, URL, UserTypes, WHITE, user } from "../../App"
import { Input, Button, ThemeProvider, createTheme } from "@rneui/themed"
import axios, { AxiosError, AxiosResponse } from "axios"
import SelectDropdown from "react-native-select-dropdown"
import { showMessage } from 'react-native-flash-message'

export default function CreateAccount() {
    const isDark = useColorScheme() === 'dark'

    const userData = useContext(user as Context<UserTypes>)

    const [options, setOptions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const accData = useRef({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        username: '',
        companyName: ''
    })


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
            fontSize: 20
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
                <Text style={style.headingText}>CREATE AN ACCOUNT</Text>
            </View>

            <View style={style.form}>
                <Input onChangeText={(e) => accData.current.firstName = e} style={style.input} placeholder="First Name" />
                <Input onChangeText={(e) => accData.current.lastName = e} style={style.input} placeholder="Last Name" />
                <Input onChangeText={(e) => accData.current.password = e} style={style.input} secureTextEntry placeholder="Password" />
                <Input onChangeText={(e) => accData.current.confirmPassword = e} style={style.input} secureTextEntry placeholder="Confirm Password" />
                <Input onChangeText={(e) => accData.current.username = e} style={style.input} placeholder="Username" />
                <SelectDropdown data={options} onSelect={handleSelectChange} rowTextStyle={buttonStyle.rowText} rowStyle={buttonStyle.row} buttonTextStyle={buttonStyle.buttonText} buttonStyle={buttonStyle.button} defaultButtonText="Select A Company"/>
                <ThemeProvider theme={theme}>
                    <Button onPress={submitRegister} disabled={isLoading} title={'Create An Account'} />
                </ThemeProvider>
                
            </View>
        </View>
    )
}

