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

    const regex = emojiRegex()

    const bgColor = !isIncoming ? GREEN : isDark ? LIGHTER_BLACK : DARKER_WHITE
    const txtColor = !isIncoming ? WHITE : isDark ? WHITE : BLACK
    return(
        <View style={{justifyContent: isIncoming ? 'flex-start' : 'flex-end', flexDirection: 'row'}}>
            <View style={{...style.message, maxWidth: Dimensions.get('window').width * .7}} >
                <Text style={{...style.messageText, color: txtColor, backgroundColor: bgColor, textAlign: 'left', fontSize: regex.test(content) ? 22 : 12}} >
                    {content}
                </Text>
            </View>
        </View>
    )
}


const style = StyleSheet.create({
    messageText: {
        flexDirection: 'row',
        flex: 1,
        flexWrap: 'wrap',
        minHeight: 20,
        borderRadius: 17,
        paddingHorizontal: 10,
        paddingTop: 5,
        paddingBottom: 7
    },
    message: {
        
        justifyContent: 'flex-end',
        
        marginTop: 10
    }
})