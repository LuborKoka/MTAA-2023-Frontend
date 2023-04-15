import React, { useContext, useEffect, useState } from "react"
import { user } from "../../App"
import { useColorScheme, StyleSheet, ScrollView, View, useWindowDimensions } from "react-native"
import Account from "../subComponents/Account"
import { BLACK, WHITE } from "../constants/constants"
import Loader from 'react-native-spinkit'
import useFetch from "../hooks/useFetch"
import Icon from 'react-native-vector-icons/Entypo'
import { Text } from "@rneui/base"

interface response {
    token?: string,
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

    const userData = useContext(user)!

    const [elements, setElements] = useState<JSX.Element[]>([])

    const { height } = useWindowDimensions()


    const [data, isLoading, isError] = useFetch<response>('/finances/init', `user_${userData.id}_finances`)

    const style = StyleSheet.create({
        container: {
            backgroundColor: isDark ? BLACK : WHITE,
            flexGrow: 1,
            paddingHorizontal: 10
        },
        iban: {
            color: isDark ? WHITE : BLACK,
            fontWeight: 'bold'
        }
    })

    const error = (
        <View style={{alignItems: 'center', justifyContent: 'center', paddingTop: '50%', gap: 50}} key={'1'} >
            <Icon name="emoji-sad" style={{color: isDark ? WHITE : BLACK, fontSize: 150}} />
            <Text style={{fontWeight: 'bold', color: isDark ? WHITE : BLACK}}>Error Loading Content</Text>
        </View>
    )

    useEffect(() => {
        if ( !isError && data != undefined) {
            setElements( data.accounts.map( e => <Account account={e} key={e.iban} /> ))
        } 
        else setElements([error])
    }, [data, isError, isDark])

    
    return(
        <ScrollView style={ style.container }>
            { isLoading ?
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: height - 100}}>
                <Loader type='Circle' color={isDark ? WHITE : BLACK} size={120} />
            </View> : 
            elements}
            
        </ScrollView>
    )
}