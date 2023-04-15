import { ScrollView, View, Text, useColorScheme, StyleSheet, Dimensions, useWindowDimensions } from 'react-native'
import React, { Context, useContext, useEffect, useState } from 'react'
import { BLACK, RED, WHITE } from '../constants/constants'
import { UserTypes, user } from '../../App'
import Item from '../subComponents/historyItem'
import Icon from 'react-native-vector-icons/FontAwesome'
import Loader from 'react-native-spinkit'
import useFetch from '../hooks/useFetch'
import EIcon from 'react-native-vector-icons/Entypo'

interface response {
  token?: string,
  payments: {
    total: number,
    invoiceID: string,
    paidAt: string
  }[]
}


export default function History() {
  const isDark = useColorScheme() === 'dark'

  const [items, setItems] = useState<JSX.Element[]>([])
  const [pdf, setPdf] = useState<JSX.Element | null>(null)

  const userData = useContext(user as Context<UserTypes>)

  const { height } = useWindowDimensions()

  const [data, isLoading, isError] = useFetch<response>('/init/invoices', `user_${userData.id}_history`)

  const error = (
    <View style={{alignItems: 'center', justifyContent: 'center', paddingTop: '50%', gap: 50}} key={'1'} >
        <EIcon name="emoji-sad" style={{color: isDark ? WHITE : BLACK, fontSize: 150}} />
        <Text style={{fontWeight: 'bold', color: isDark ? WHITE : BLACK}}>Error Loading Content</Text>
    </View>
)

  useEffect(() => {
    if ( !isError && data != undefined ) {
      setItems( data.payments.map( e => 
        <Item token={userData.token} {...e} setPdf={setPdf} key={e.invoiceID} />  
      ))
    }
  }, [data, isError])

  const loader = (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: height - 100, backgroundColor: isDark ? BLACK : WHITE}}>
      <Loader type='Circle' color={isDark ? WHITE : BLACK} size={120} />
    </View> 
  )

  const content = (
    <ScrollView style={{backgroundColor: isDark ? BLACK : WHITE, ...style.container}}> 
      { 
      (items.length === 0) ?
        <View style={{alignItems: 'center', paddingTop: 50}}>
          <Text style={{color: isDark ? WHITE : BLACK, fontWeight: 'bold'}}>This Company Made No Purchases</Text>
          <Icon name='exclamation-triangle' color={RED} style={{paddingTop: 50, fontSize: 50}} />
        </View> :
        <>
          <View style={{...style.paymentHeader, paddingVertical: pdf == null ? 0 : 10}}>
            <Text style={{color: isDark ? WHITE : BLACK, width: (Dimensions.get('window').width-40) * .40, fontWeight: 'bold', fontSize: 17}}>Date</Text>
            <Text style={{color: isDark ? WHITE : BLACK, width: (Dimensions.get('window').width-40) * .35, fontWeight: 'bold', fontSize: 17}}>Cost</Text>
          </View>
          {items}
        </>
      }
    </ScrollView>
  )

  const validContent = (
    pdf == null ?
      isLoading ?
        loader : 
        content :
      pdf
    )

  return (
    isError ? error : validContent
  )
}


const style = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderRadius: 3
  },
  paymentHeader: {
    alignItems: 'center',
    flexDirection: 'row'
  }
})