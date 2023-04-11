import { KeyboardAvoidingView, View, Text, StyleSheet, useColorScheme, Dimensions, Animated, TouchableOpacity, ScrollView, TextInput} from 'react-native'
import React, { Context, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { BLACK, DARKER_WHITE, GREEN, LIGHTER_BLACK, RED, URL, WHITE } from '../constants/constants'
import Icon from 'react-native-vector-icons/FontAwesome5'
import OIcon from 'react-native-vector-icons/Octicons'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import Message from '../subComponents/Message'
import 'react-native-get-random-values'
import { v4 } from 'uuid';
import { ServerTypes, UserTypes, serverContext, user } from '../../App'
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage'
//src: https://pixabay.com/sound-effects/search/messaging/
import Sound from 'react-native-sound'


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
    const ws = useContext(serverContext as Context<ServerTypes>)

    const [messages, setMessages] = useState<JSX.Element[]>([])
    const [isRecording, setIsRecording] = useState(false)

    const position = useRef(new Animated.Value(0)).current
    const content = useRef<ScrollView | null>(null)

    const input = useRef('')
    const audio = useRef(new Sound('new_message.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('Failed to load the sound', error)
          return
        }
    }))

    const inputComponent = useRef<TextInput | null>(null)
    const history = useRef<storage['messages']>([])

    const { getItem, setItem } = useAsyncStorage(`me_${userData.id}_with_${userID}`)

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
      
    
      
    function pushNewMessage() {
        if (ws.server == null ) return
        const content = input.current.trim()
        if ( content === '' ) return
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
        ws.server.send(message)
        history.current.push({isIncoming: false, content: content})
    }

    const scrollDown = useCallback( ()=> {
        (content.current as ScrollView).scrollToEnd()
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

        } catch(e: any) {
            console.log('Error loading data from async storage')
            console.log(e)
        }
    }, [userID, userData.id, setMessages])


    useEffect(() => {
        scrollDown()
    }, [messages, scrollDown])

    useEffect(() => {
        isOpenChat ? openChat() : closeChat()
    }, [isOpenChat])

    useEffect(() => {
        (ws.server as WebSocket).onmessage = (e) => {
            const message = JSON.parse(e.data) as message
            if (message.type === 'MESSAGE') {
                if ( message.data.from === userID ) {
                    history.current.push({isIncoming: true, content: message.data.content})
                    setMessages((prevMessages) => [
                        ...prevMessages, <Message key={v4()} content={message.data.content} isIncoming />
                    ])
                    audio.current.play()
                    setTimeout(() => audio.current.stop(), 1000)
                }
                else setIncomingMessageFromAnotherUser(message.data.from, userData.id, message.data.content)
            }
        }

        return (() => {
            (ws.server as WebSocket).onmessage = null
        })
    }, [ws.server, userID, audio.current])

    useEffect(() => {
        showHistory()

        return( () => {
            if ( history.current.length > 0 ) {
                const d = JSON.stringify({messages: history.current} as storage)
                setItem(d)
            }
            history.current = []
            //AsyncStorage.clear()
        })  
    }, [showHistory, userID])

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




async function setIncomingMessageFromAnotherUser(from: string, me: string, content: string) {
    try {
        const d = await AsyncStorage.getItem(`me_${me}_with_${from}`)
        if ( d !== null ) {
            const data = JSON.parse(d) as storage
            data.messages.push({isIncoming: true, content: content})
            AsyncStorage.setItem(`me_${me}_with_${from}`, JSON.stringify(data))
        } else {
            const data: storage = {messages: [{isIncoming: true, content: content}]}
            AsyncStorage.setItem(`me_${me}_with_${from}`, JSON.stringify(data))
        }

    } catch(e: any) {
        console.log(e)
        console.log('Error in storing the received message')
    }
}