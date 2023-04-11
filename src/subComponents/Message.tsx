import React from "react"
import { useColorScheme, Dimensions, View, Text, StyleSheet } from 'react-native'
import { GREEN, WHITE, BLACK, DARKER_WHITE, LIGHTER_BLACK } from "../constants/constants"
import emojiRegex from "emoji-regex"

interface messageProps {
    isIncoming?: boolean,
    content: string
}

export default function Message({ isIncoming = false, content }: messageProps) {
    const isDark = useColorScheme() === 'dark'

    function findEmoji(content: string) {
        const emojiOnlyRegex = emojiRegex()
        const emojis = content.match(emojiOnlyRegex)
        return emojis !== null && content.length === emojis.join('').length
    }

    const isOnlyEmoji = findEmoji(content)

    const bgColor = !isIncoming ? GREEN : isDark ? LIGHTER_BLACK : DARKER_WHITE

    const style = StyleSheet.create({
        messageText: {
            flexDirection: 'row',
            flex: 1,
            flexWrap: 'wrap',
            minHeight: 20,
            borderRadius: 17,
            paddingHorizontal: 10,
            paddingTop: isOnlyEmoji ? 0 : 5,
            paddingBottom: isOnlyEmoji ? 0 : 7,
            color: !isIncoming ? WHITE : isDark ? WHITE : BLACK,
            backgroundColor: isOnlyEmoji ? 'transparent' : bgColor, textAlign: 'left', 
            fontSize: isOnlyEmoji ? 24 : 14
        },
        message: {
            maxWidth: Dimensions.get('window').width * .7,
            justifyContent: 'flex-end',
            marginTop: isOnlyEmoji ? 0 : 10,
            marginLeft: isIncoming ? isOnlyEmoji ? 0 : 5 : 0,
            marginRight: isIncoming ? 0 : isOnlyEmoji ? 0 : 5
        },
        container: {
            justifyContent: isIncoming ? 'flex-start' : 'flex-end', 
            flexDirection: 'row'
        }
    })
    return(
        <View style={style.container}>
            <View style={style.message} >
                <Text style={style.messageText} >
                    {content}
                </Text>
            </View>
        </View>
    )
}


