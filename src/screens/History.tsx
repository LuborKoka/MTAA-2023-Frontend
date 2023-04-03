import { View, Text, useColorScheme, StyleSheet } from 'react-native'
import React, { Context, useContext, useEffect } from 'react'
import { BLACK, URL, WHITE } from '../constants/constants'
import { UserTypes, user } from '../../App'
import axios, { AxiosResponse } from 'axios'

export default function History() {
  const isDark = useColorScheme() === 'dark'

  const userData = useContext(user as Context<UserTypes>)

  useEffect( ()=> {
    axios.get(`${URL}/finances/init/${userData.companyName}`, {
      headers: {
        Authorization: `Bearer ${userData.token}`
      }
    })
    .then( (r: AxiosResponse) => {
      
    })
  }, [])


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