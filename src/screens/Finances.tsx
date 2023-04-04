import React, { Context, useContext, useEffect, useState } from "react"
import { UserTypes, user } from "../../App"
import { useColorScheme, View, StyleSheet } from "react-native"
import axios, { AxiosError, AxiosResponse } from "axios"
import { showMessage } from "react-native-flash-message"
import Account from "../subComponents/Account"
import { BLACK, GREEN, WHITE, URL } from "../constants/constants"

interface response {
    accounts: {
        iban: string,
        balance: number,
        payments: {
            total: number,
            invoiceID: string,
            isIncoming: boolean,
            paidAt: string
        }[]
    }[]
}

export default function Finances(): JSX.Element {
    const isDark = useColorScheme() === 'dark'

    const userData = useContext(user as Context<UserTypes>)

    const [elements, setElements] = useState<JSX.Element[]>([])

    const style = StyleSheet.create({
        container: {
            backgroundColor: isDark ? BLACK : WHITE,
            flex: 1,
            paddingHorizontal: 10,
            borderBottomColor: GREEN
        },
        iban: {
            color: isDark ? WHITE : BLACK,
            fontWeight: 'bold'
        }
    })

    useEffect( () => {
        axios.get(`${URL}/finances/init/${encodeURIComponent(userData.companyName)}`, {
            headers: {
                Authorization: `Bearer ${userData.token}`
            }
        })
        .then( (r: AxiosResponse) => {
            const d = r.data as response
            setElements( d.accounts.map( (e, i) => {
                return <Account key={i} account={e} />
            }))
        })
        .catch( (e: any) => {
            if ( e instanceof AxiosError ) {
                showMessage({
                    message: e.response?.data.message,
                    type: 'danger'
                })
            }
        })
    }, [])

    
    
    return(
        <View style={style.container}>
            {elements}
        </View>
    )
}