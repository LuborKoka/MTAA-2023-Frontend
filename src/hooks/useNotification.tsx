import { useState, useEffect } from 'react'
import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import messaging from '@react-native-firebase/messaging'
import { Modal, Text, View, TouchableOpacity, useColorScheme, StyleSheet, Animated } from 'react-native'
import { BLACK, GREEN, WHITE } from '../constants/constants'


export default function Notification() {
    const isDark = useColorScheme() === 'dark'

    const [isVisible, setIsVisible] = useState(true)
    const [content, setContent] = useState({title: '', body: ''})
  
    useEffect(() => {
        const unsubscribe = messaging().onMessage(remoteMessage => {
            setIsVisible(true)
            setContent({title: remoteMessage.notification!.title!, body: remoteMessage.notification!.body!})
        })


        return( () => unsubscribe())
    }, [])
  
    function handleOk() {
      setIsVisible(false)
    }

    const options = { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '0-digit'
      }

    const style = StyleSheet.create({
        container: {
            backgroundColor: isDark ? BLACK : WHITE
        },
        headingText: {
            fontWeight: 'bold',
            color: GREEN
        },
        headingContainer: {
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'flex-end'
        },
        content: {
            marginTop: 8
        }
        
    })
  
    return (
        <>
            {
                isVisible ?

                <Animated.View>
                    <View style={{...style.container, padding: 16, borderRadius: 8 }}>
                        <View style={style.headingContainer}>
                            <Text style={{...style.headingText, fontSize: 18}}>New Message</Text>
                            <Text style={style.headingText}>{new Date().toLocaleTimeString()}</Text>
                        </View>
                        <Text style={{...style.content, fontWeight: 'bold'}}>{content.title}</Text>
                        <Text style={style.content}>{content.body}</Text>
                        <TouchableOpacity onPress={handleOk} style={{ alignSelf: 'flex-end', marginTop: 16 }}>
                            <Text style={{ color: GREEN }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
        : null
            }
        </>
        
    )
  }


export function useNotification() {
    const [token, setToken] = useState<string>()
    const { getItem, setItem } = useAsyncStorage('FireBaseToken') 

    async function getToken() {
        try {
            const token = await getItem()
            if ( token == null ) {
                const token = await messaging().getToken()
                setToken(token)
                setItem(token) 
                return
            }
            setToken(token)
        }
        catch(e: any) {
            const token = await messaging().getToken()
            setToken(token)
            setItem(token)
        }
    }

    useEffect(() => {
        getToken()
    }, [])



    return token
}