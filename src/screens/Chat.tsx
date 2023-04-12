import { useColorScheme, StyleSheet, Image, ScrollView, View, Dimensions, useWindowDimensions } from 'react-native'
import React, { Context, useContext, useEffect, useState, useRef } from 'react'
import { UserTypes, user } from '../../App'
import axios, { AxiosError, AxiosResponse} from 'axios'
import { BLACK, URL, WHITE } from '../constants/constants'
import { showMessage } from 'react-native-flash-message'
import ChatWindow from './chatWindow'
import Route from '../subComponents/Route'
import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import NetInfo from "@react-native-community/netinfo"
import Loader from 'react-native-spinkit'


interface response {
    users: {
        userID: string,
        firstName: string,
        lastName: string,
        companyName: string
    }[]
}

interface data {
    firstName: string,
    lastName: string,
    userID: string,
    companyName: string
}




export default function Chat() {
    const isDark = useColorScheme() === 'dark'

    const [router, setRouter] = useState<JSX.Element[]>([])
    const [isOpenChat, setIsOpenChat] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [chatData, setChatData] = useState<data>({firstName: '', lastName: '', userID: '', companyName: ''})

    const isUpToDate = useRef(false)

    const userData = useContext(user as Context<UserTypes>)

    const { height } = useWindowDimensions()

    const { getItem, setItem } = useAsyncStorage(`user_${userData.id}_chat`)

    async function fetchData(isConnected: boolean) {
        if ( isUpToDate.current ) return
        if ( isConnected ) {
            setIsLoading(true)
            axios.get(`${URL}/chat/init?userID=${userData.id}`, {
                headers: {
                    Authorization: `Bearer ${userData.token}`
                }
            })
            .then( (r: AxiosResponse) => {
                setRouter( (r.data as response).users.map( e => {
                    return <Route firstName={e.firstName} lastName={e.lastName} userID={e.userID} companyName={e.companyName} setChatData={setChatData} setIsChatOpen={setIsOpenChat} key={e.userID} />
                }))
                setItem(JSON.stringify(r.data))
            })
            .catch( (e: any) => {
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
            })
            .finally(() => setIsLoading(false))
            return
        }
        setIsLoading(true)
        getItem()
        .then(d => {
            if ( d == null ) return
            const data = JSON.parse(d) as response
            setRouter( data.users.map( e => {
                return <Route firstName={e.firstName} lastName={e.lastName} userID={e.userID} companyName={e.companyName} setChatData={setChatData} setIsChatOpen={setIsOpenChat} key={e.userID} />
            }))
        })
        .finally(() => setIsLoading(false))

    }
    
    useEffect( () => {
        const unsubscribe = NetInfo.addEventListener(state => {
            fetchData(!!state.isConnected)
        })   

        return( ()=> unsubscribe())
    }, [])

    const loader = (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: height - 100, backgroundColor: isDark ? BLACK : WHITE}}>
          <Loader type='Circle' color={isDark ? WHITE : BLACK} size={120} />
        </View> 
      )

    return (
        <>
        {
            isLoading ?
                loader :
                <>
                    <ScrollView style={{...style.container, backgroundColor: isDark ? BLACK : WHITE}}>
                        <View style={{paddingTop: 40}}>
                            {router}
                        </View>
                        <View style={{height: 40}}></View>     
                    </ScrollView>
                    <ChatWindow setIsOpenChat={setIsOpenChat} {...chatData} isOpenChat={isOpenChat} />  
                </>
        }        
        </>   
    )
}


const style = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        height: Dimensions.get('window').height - 55,
        paddingBottom: 20
    }
})