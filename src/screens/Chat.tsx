import { useColorScheme, StyleSheet, Text, ScrollView, View, Dimensions, useWindowDimensions } from 'react-native'
import React, { Context, useContext, useEffect, useState } from 'react'
import { UserTypes, user } from '../../App'
import { BLACK, WHITE } from '../constants/constants'
import ChatWindow from './chatWindow'
import Route from '../subComponents/Route'
import Loader from 'react-native-spinkit'
import useFetch from '../hooks/useFetch'
import Icon from 'react-native-vector-icons/Entypo'


interface response {
    token?: string,
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
    const [chatData, setChatData] = useState<data>({firstName: '', lastName: '', userID: '', companyName: ''})

    const userData = useContext(user as Context<UserTypes>)

    const { height } = useWindowDimensions()

    const [data, isLoading, isError] = useFetch<response>('/chat/init', `user_${userData.id}_chat`)


    const error = (
        <View style={{alignItems: 'center', justifyContent: 'center', paddingTop: '50%', gap: 50}} key={'1'} >
            <Icon name="emoji-sad" style={{color: isDark ? WHITE : BLACK, fontSize: 150}} />
            <Text style={{fontWeight: 'bold', color: isDark ? WHITE : BLACK}}>Error Loading Content</Text>
        </View>
    )

    useEffect(() => {
        if ( !isError && data != undefined ) {
            setRouter( data.users.map( e => 
                <Route {...e} setChatData={setChatData} setIsChatOpen={setIsOpenChat} key={e.userID} />    
            ))
        }
        else setRouter([error])
    }, [data, isError, isDark])


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