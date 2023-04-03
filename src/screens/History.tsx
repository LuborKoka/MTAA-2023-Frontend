import { View, Text, useColorScheme, StyleSheet } from 'react-native'
import React from 'react'
import { BLACK, WHITE } from '../constants/constants'

export default function History() {
  const isDark = useColorScheme() === 'dark'


  return (
    <View>
      
    </View>
  )
}


const style = StyleSheet.create({
  bgColorWhite: {
    backgroundColor: WHITE
  },
  bgColorBlack: {
    backgroundColor: BLACK
  }
})