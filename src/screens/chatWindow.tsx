import { AppState, KeyboardAvoidingView, View, Text, StyleSheet, useColorScheme, Dimensions, Animated, TouchableOpacity, ScrollView, TextInput, BackHandler } from 'react-native'
import React, { Context, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { BLACK, DARKER_WHITE, GREEN, LIGHTER_BLACK, RED, URL, WHITE } from '../constants/constants'
import Icon from 'react-native-vector-icons/FontAwesome5'
import OIcon from 'react-native-vector-icons/Octicons'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import Message from '../subComponents/Message'
import 'react-native-get-random-values'
import { v4 } from 'uuid';
import { UserTypes, user } from '../../App'
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage'
//src: https://pixabay.com/sound-effects/search/messaging/
import Sound from 'react-native-sound'
import NetInfo from '@react-native-community/netinfo'
import { AsyncStorageHook } from '@react-native-async-storage/async-storage/lib/typescript/types'
import { useNotification } from '../hooks/useNotification'


interface props {
    setIsOpenChat: React.Dispatch<React.SetStateAction<boolean>>,
    isOpenChat: boolean,
    firstName: string,
    lastName: string,
    userID: string,
    companyName: string
}

interface message {
    type: string,
    data: {
        from: string,
        to: string,
        content: string
    }
}


interface storage {
    messages: {
        isIncoming: boolean,
        content: string
    }[]
}


export default function ChatWindow({ setIsOpenChat, isOpenChat, firstName, lastName, userID }: props) {
    const isDark = useColorScheme() === 'dark'

    const userData = useContext(user as Context<UserTypes>)

    const isBackground = useRef(true)
    const [messages, setMessages] = useState<JSX.Element[]>([])
    const [isRecording, setIsRecording] = useState(false)

    const position = useRef(new Animated.Value(0)).current
    const content = useRef<ScrollView | null>(null)

    const input = useRef('')
    const ws = useRef<WebSocket | null>(null)
    const audio = useRef(new Sound('new_message.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('Failed to load the sound', error)
          return
        }
    }))

    const inputComponent = useRef<TextInput | null>(null)
    const history = useRef<storage['messages']>([])

    const { getItem, setItem } = useAsyncStorage(`me_${userData.id}_with_${userID}`)
    const offline = useAsyncStorage(`offline_messages`)
    const lastOnline = useAsyncStorage(`lastOnline_${userData.id}`)

    const token = useNotification()

    const bgColor = isDark ? LIGHTER_BLACK : DARKER_WHITE
    const txtColor = isDark ? WHITE : BLACK

    function openChat() {
        Animated.timing(position, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start()
    }
    
    function closeChat() {
        Animated.timing(position, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start()
    }

    const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get('window').width, 0]
    })
      
    
      
    async function pushNewMessage() {
        if (ws.current == null ) return
        const content = input.current.trim()
        if ( content === '' ) return

        const state = await NetInfo.fetch()

        if ( !state.isConnected && !state.isInternetReachable ) {
            sendOffline(content, userData.id, userID, offline)
            setMessages(p => [...p, <Message key={v4()} content={content} isSent={false} />]);
            (inputComponent.current as TextInput).clear()
            input.current = ''
            return
        }

        const message = JSON.stringify({
            type: 'MESSAGE',
            data: {
                from: userData.id,
                to: userID,
                content: content
            }
        })
        setMessages(p => [...p, <Message key={v4()} content={content} />]);
        (inputComponent.current as TextInput).clear()
        input.current = ''
        ws.current.send(message)
        history.current.push({isIncoming: false, content: content})
    }

    const scrollDown = useCallback( ()=> {
        content.current?.scrollToEnd()
    }, [])


    function startRecording() {
        setIsRecording(true)
        //pokial sa ti podari spojazdnit nejaku libku na to.. 
    }

    function deleteRecording() {
        setIsRecording(false)
    }

    const showHistory = useCallback( async () =>{
        try {
            const d = await getItem()
            if ( d !== null ) {
                const data = JSON.parse(d) as storage
                history.current = data.messages.map(e => {return {
                    isIncoming: e.isIncoming,
                    content: e.content
                }})
                setMessages(data.messages.map(e => <Message key={v4()} content={e.content} isIncoming={e.isIncoming} />))
            } else {
                setMessages([])
            }
            content.current?.scrollToEnd()
        } catch(e: any) {
            console.log('Error loading data from async storage')
            console.log(e)
        }
    }, [userID, userData.id, setMessages])


    async function connectToWebSocketServer() {
        ws.current = new WebSocket(URL)
        lastOnline.setItem(new Date().toISOString())
        ws.current.onopen = () => {
          const user = {type: 'LOGIN', data: {
            userID: userData.id,
            token: token,
            name: `${userData.firstName} ${userData.lastName}`
          }}
          ws.current!.send(JSON.stringify(user))
    
          setTimeout(() => once = true, 200)
    
          setTimeout(() => sendOfflineMessages(ws.current!, offline), 200)
        }
    }

    useEffect(() => {
        setTimeout(() => scrollDown(), 100)
    }, [messages, scrollDown])

    useEffect(() => {
        isOpenChat ? openChat() : closeChat()
    }, [isOpenChat])


    let once = true
    //listen for messages
    useEffect(() => {
        if ( token == undefined ) return
        const unsubscribe = NetInfo.addEventListener(state => {
            if ( state.isConnected && state.isInternetReachable && once ) {
                once = false
                setTimeout(() => connectToWebSocketServer(), 100)
            }
            showHistory()
        })

        return( () => {
            unsubscribe()
            const logout = JSON.stringify({type: 'LOGOUT', data: userData.id})
            
            userData.id = ''
            ws.current!.send(logout)
            ws.current!.close(1000, 'Logout')
            lastOnline.setItem(new Date().toISOString())
          })
    
    }, [token])

    //show previous chat messages
    useEffect(() => {  
        if ( ws.current == null ) return
        showHistory()
        
        ws.current.onmessage = e => {
            const message = JSON.parse(e.data) as message
            if (message.type === 'MESSAGE') {
                if ( message.data.from === userID ) {
                    history.current.push({isIncoming: true, content: message.data.content})
                    setMessages((prevMessages) => [
                        ...prevMessages, <Message key={v4()} content={message.data.content} isIncoming />
                    ])
                    if ( isBackground.current ) {
                        audio.current.play()
                        setTimeout(() => audio.current.stop(), 1000)
                    }
                    
                }
                else if ( message.data.to === userID ) {
                    history.current.push({isIncoming: false, content: message.data.content})
                    setMessages((prevMessages) => [
                        ...prevMessages, <Message key={v4()} content={message.data.content} />
                    ])
                }
                else setMessageWithAnotherUser(message.data.from, message.data.to, message.data.content, userData.id)
            }
        }

        return( () => {
            if ( history.current.length > 0 ) {
                const d = JSON.stringify({messages: history.current} as storage)
                setItem(d)
            }
            history.current = []
            //AsyncStorage.clear()
        })  
    }, [showHistory, userID])

    useEffect(() => {
        function checkAppState() {
            const state = AppState.currentState

            if ( state === 'active' ) isBackground.current = false
            else isBackground.current = true
        }

        const subscribe = AppState.addEventListener('change', checkAppState)

        return(() => subscribe.remove())
    }, [])

    return (
        <Animated.View style={{...style.animatedContainer, transform: [{translateX: translateX}]}}>
            <KeyboardAvoidingView style={{flex: 1, backgroundColor: isDark ? BLACK : WHITE}}>
                <View style={{...style.header, borderBottomColor: isDark ? 'rgba(234, 234, 234, .2)' : 'rgba(48, 48, 48, .2)'}} >
                    <View style={{paddingBottom: 3}}>
                        <TouchableOpacity onPress={() => setIsOpenChat(false)}>
                            <Icon name='long-arrow-alt-left' style={{color: GREEN, fontSize: 28}} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{fontSize: 18, color: isDark ? WHITE : BLACK}}>
                        {`${firstName} ${lastName}`}
                    </Text>

                    <View style={{width: 10}}></View>
                </View>


                <ScrollView ref={content} style={{flexGrow: 1, ...style.content}}>
                    {messages}
                </ScrollView>

                <View style={style.inputContainer}>
                    { isRecording ? 
                    <TouchableOpacity style={{paddingRight: 5}} onPress={deleteRecording} >
                        <FAIcon name='trash' style={{color: RED, fontSize: 26}} />
                    </TouchableOpacity>
                        :
                    <TouchableOpacity style={{paddingRight: 5}} onPress={startRecording}>
                        <Icon name='microphone' style={{color: GREEN, fontSize: 26}} />
                    </TouchableOpacity>
                    }
                    <TextInput onFocus={scrollDown} multiline ref={inputComponent} onChangeText={(t) => input.current = t} placeholder='Your Message' placeholderTextColor={GREEN} style={{...style.textInput, backgroundColor: bgColor, color: txtColor}} />
                    <TouchableOpacity onPress={pushNewMessage}>
                        <OIcon name='paper-airplane' style={{color: GREEN, fontSize: 26}} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    )
}


const style = StyleSheet.create({
    animatedContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 2
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        columnGap: 20,
        justifyContent: 'space-evenly',
        borderBottomWidth: 1
    },
    content: {
        paddingHorizontal: 10
    },
    inputContainer: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: 25,
        flexDirection: 'row',
        columnGap: 10,
        alignItems: 'center'
    },
    textInput: {
        flex: 1,
        borderRadius: 10,
        paddingHorizontal: 10
    }
})


async function setMessageWithAnotherUser(from: string, to: string, content: string, myID: string) {
    const isIncoming = myID === to
    try {
        const d = await AsyncStorage.getItem(`me_${myID}_with_${isIncoming ? from : to}`)
        if ( d !== null ) {
            const data = JSON.parse(d) as storage
            data.messages.push({isIncoming: isIncoming, content: content})
            AsyncStorage.setItem(`me_${myID}_with_${isIncoming ? from : to}`, JSON.stringify(data))
        } else {
            const data: storage = {messages: [{isIncoming: isIncoming, content: content}]}
            AsyncStorage.setItem(`me_${myID}_with_${isIncoming ? from : to}`, JSON.stringify(data))
        }
  
    } catch(e: any) {
        console.log(e)
        console.log('Error in storing the received message')
    }
  }



async function sendOffline(content: string, from: string, to: string, storage: AsyncStorageHook) {
    const unsent = await storage.getItem()

    type message = {
        from: string,
        to: string,
        content: string
    }

    if ( unsent == null ) {
        await storage.setItem(JSON.stringify([{
            from: from,
            to: to,
            content: content
        }]))
        return
    }

    const messages = JSON.parse(unsent) as message[]

    messages.push({
        from: from,
        to: to,
        content: content
    })

    storage.setItem(JSON.stringify(messages))
}






  async function sendOfflineMessages(ws: WebSocket, storage: AsyncStorageHook) {
    type message = {
      from: string,
      to: string,
      content: string
    }
    
    try {
      const d = await storage.getItem()
      if ( d == null ) return
  
      const messages = JSON.parse(d) as message[]
  
      messages.forEach(m => {
        const data = JSON.stringify({
          type: 'MESSAGE',
          data: {
              from: m.from,
              to: m.to,
              content: m.content
            }
          })
        ws.send(data)
        
      })
  
      storage.removeItem()
  
    }
    catch(e: any) {
      console.log('error\n', e)
    }
  }