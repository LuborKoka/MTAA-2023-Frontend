import React, { useRef, useState} from "react"
import { useColorScheme, Dimensions, LayoutChangeEvent, View, Text, StyleSheet } from 'react-native'
import { GREEN, WHITE, BLACK, DARKER_WHITE, LIGHTER_BLACK } from "../constants/constants"

interface messageProps {
    isIncoming?: boolean,
    content: string
}

export default function Message({ isIncoming = false, content }: messageProps) {
    const isDark = useColorScheme() === 'dark'

    const [width, setWidth] = useState(0)
    const isSet = useRef(false)

    const bgColor = !isIncoming ? GREEN : isDark ? LIGHTER_BLACK : DARKER_WHITE
    const txtColor = !isIncoming ? WHITE : isDark ? WHITE : BLACK

    function updateWidth(e: LayoutChangeEvent) {
        if ( !isSet.current ) {
            setWidth(Math.min(Dimensions.get('window').width * .7, e.nativeEvent.layout.width))
            isSet.current = true
        }
    }

    return(
        <View style={{justifyContent: isIncoming ? 'flex-start' : 'flex-end', flexDirection: 'row'}}>
            <View style={{...style.message, maxWidth: Dimensions.get('window').width * .7}} /* my intention is to make this view screen width * .7 wide or less, and when the text would be wider, than wrap the text, add some new lines, you know like facebook. the message content has a maximum width and if it is larger, newlines will be added. but now, new lines are added even if the text is not wider. i think the auto property is trying to format the text to multiple lines of the same width  */>
                <Text style={{...style.messageText, color: txtColor, backgroundColor: bgColor, textAlign: 'left' /*isIncoming ? 'left' : 'right'*/}} onLayout={updateWidth} >
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