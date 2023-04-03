import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, Animated, Easing } from 'react-native'
import React, { useState, useRef } from 'react'
import { BLACK, GREEN, RED, WHITE } from "../constants/constants"
import Icon from 'react-native-vector-icons/FontAwesome5'
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons'

interface props {
    account: {
        iban: string,
        balance: number,
        payments: {
            total: number,
            invoiceID: string,
            isIncoming: boolean,
            paidAt: string
        }[]
    }
}

type paymentType = props['account']['payments'][number]

interface payment {
  payment: paymentType
}



export default function Account({ account }: props) {
    const isDark = useColorScheme() === 'dark'

    const [isExpanded, setIsExpanded] = useState(false)
    const [isSetHeight, setIsSetHeight] = useState(false)

    const rotation = useRef(new Animated.Value(0)).current
    const height = useRef(new Animated.Value(0)).current
    const paymentsHeight = useRef<number>(0)

    function formatNumber(n: number) {
        const roundedNumber = Math.round(n * 100) / 100
      
        const [integerPart, decimalPart] = roundedNumber.toString().split('.')

        //tuto som bez hanby okopiroval z chatgpt replace funkciu
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

        return `${formattedInteger}.${decimalPart === undefined ? '00' : decimalPart}€`
      }

    const openPayments = () => {
        Animated.timing(rotation, {
            toValue: isExpanded ? 0 : 1,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start()

        Animated.timing(height, {
            toValue: isExpanded ? 0 : 1, //paymentsHeight.current,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start()
    }

    function toggle() {
        openPayments()
        setIsExpanded(!isExpanded)
    }

    const rotationDeg = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-180deg'],
    })

    const maxHeight = height.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [0, 95.545]
    })

    const style = StyleSheet.create({
        iban: {
            color: isDark ? WHITE : BLACK,
            fontWeight: 'bold',
            alignItems: 'center',
            paddingVertical: 15
        },
        header: {
            flexDirection: 'row',
            minHeight: 80,
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomColor: isDark ? WHITE : BLACK,
            borderBottomWidth: .5,
            paddingHorizontal: 10
        },
        text: {
            color: isDark ? WHITE : BLACK
        },
        paymentsContainer: {
            paddingHorizontal: 10
        },
        paymentItem: {
            flexDirection: 'row',
            justifyContent: 'space-between'
        }
    })

    return (
        <View>
            <View style={style.header}>
                <TouchableOpacity onPress={toggle} >
                    <Animated.View style={{transform: [{rotate: rotationDeg}]}}>
                        <Icon name='caret-down' color={isDark ? WHITE : BLACK} size={35} />
                    </Animated.View>
                </TouchableOpacity>
                <Text style={style.iban} >{account.iban}</Text>
            </View>
            
            <Animated.View style={{maxHeight: maxHeight, ...style.paymentsContainer, overflow: 'hidden'}}  >
                <View onLayout={(e)=> {if ( !isSetHeight ) paymentsHeight.current += e.nativeEvent.layout.height; setIsSetHeight(true)}}>
                    <View style={{...style.paymentItem, paddingBottom: 10, paddingTop: 5}}>
                        <Text style={style.text}>
                            Current Balance
                        </Text>
                        <Text style={{...style.text, fontWeight: 'bold'}}>
                            {formatNumber(account.balance)}
                        </Text>
                    </View>
                    
                    {account.payments.map( (e, i) => {
                        return (
                        <View style={[style.paymentItem]} key={i} >
                            <Text style={style.text}>
                                {e.paidAt}
                            </Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <MIcon name={`cash-${e.isIncoming ? 'plus' : 'minus'}`} style={{color: e.isIncoming ? GREEN : RED, fontSize: 30, paddingRight: 5}} />
                                <Text style={{color: e.isIncoming ? GREEN : RED}}>
                                    {formatNumber(e.total)}
                                </Text>
                            </View>
                        </View>
                        )
                    })}
                </View>
            </Animated.View>
        </View>
    )
}