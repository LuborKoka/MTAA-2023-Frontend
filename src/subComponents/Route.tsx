import React from "react"
import { TouchableOpacity, Image, View, Text, StyleSheet, useColorScheme, useWindowDimensions } from "react-native"
import image from '../images/harold.jpg'
import { BLACK, WHITE } from "../constants/constants"

interface data {
    firstName: string,
    lastName: string,
    userID: string,
    companyName: string
}

interface props {
    firstName: string,
    lastName: string,
    userID: string,
    companyName: string,
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setChatData: React.Dispatch<React.SetStateAction<data>>
}

export default function Route({firstName, lastName, userID, companyName, setIsChatOpen, setChatData}: props) {
    const isDark = useColorScheme() === 'dark'
    const { width, height, fontScale } = useWindowDimensions()
    const fontSize = Math.min(width, height) * 0.04 * fontScale * .5

    async function open() {
        setIsChatOpen(true)
        setChatData({
            userID: userID,
            firstName: firstName,
            lastName: lastName,
            companyName: companyName
        })
    }

    return(
        <TouchableOpacity onPress={open} style={{...style.routeContainer, borderColor: isDark ? 'rgba(234, 234, 234, .1)' : 'rgba(48, 48, 48, .1)', columnGap: width * .07}} >
            <Image source={image} style={{width: 50, height: 50, borderRadius: 25}} />
            <View>
                <Text style={{color: isDark ? WHITE : BLACK, ...style.route, fontSize: fontSize}}>
                    {`${firstName} ${lastName}`}
                </Text>
                <Text style={{color: isDark ? WHITE : BLACK, opacity: .6, fontSize: fontSize - 2}}>
                    {companyName}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const style = StyleSheet.create({
    route: {
        fontWeight: 'bold'
    },
    routeContainer: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        paddingVertical: 10,
        alignItems: 'center',
        columnGap: 30,
        borderWidth: 1,
        borderRadius: 10,
        marginVertical: 10
    }
})