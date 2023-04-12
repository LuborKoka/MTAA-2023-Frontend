import React, { Context, useContext, useEffect, useState, useRef } from "react"
import { UserTypes, user } from "../../App"
import { useColorScheme, StyleSheet, ScrollView, View, useWindowDimensions } from "react-native"
import axios, { AxiosError, AxiosResponse } from "axios"
import { showMessage } from "react-native-flash-message"
import Account from "../subComponents/Account"
import { BLACK, GREEN, WHITE, URL } from "../constants/constants"
import { useAsyncStorage } from "@react-native-async-storage/async-storage"
import NetInfo from "@react-native-community/netinfo"
import Loader from 'react-native-spinkit'

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
    const [isLoading, setIsLoading] = useState(false)

    const { height } = useWindowDimensions()

    const isUpToDate = useRef(false)

    const { getItem, setItem } = useAsyncStorage(`user_${userData.id}_finances`)

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

    async function fetchData(isConnected: boolean) {
        if ( isUpToDate.current ) return
        if ( isConnected ) {
            setIsLoading(true)
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
                setItem(JSON.stringify(d))
                isUpToDate.current = true
            })
            .catch( (e: any) => {
                if ( e instanceof AxiosError ) {
                    showMessage({
                        message: e.response?.data.message,
                        type: 'danger'
                    })
                }
            })
            .finally(() => {
                setIsLoading(false)

            })
        } else  {
            setIsLoading(true)
            getItem()
            .then( d => {
                if ( d == null ) return
                const data = JSON.parse(d) as response
                setElements( data.accounts.map( (e, i) => {
                    return <Account key={i} account={e} />
                }))
            })
            .finally(() => setIsLoading(false))
        }
    }

    useEffect( () => {
        const unsubscribe = NetInfo.addEventListener(state => {
            fetchData(!!state.isConnected)
        })   

        return( ()=> unsubscribe())
    }, [])

    
    
    return(
        <ScrollView style={style.container}>
            { isLoading ?
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: height - 100}}>
                <Loader type='Circle' color={isDark ? WHITE : BLACK} size={120} />
            </View> : 
            elements}
            
        </ScrollView>
    )
}