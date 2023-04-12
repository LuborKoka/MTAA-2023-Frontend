import { ScrollView, View, Text, useColorScheme, StyleSheet, Dimensions, useWindowDimensions } from 'react-native'
import React, { Context, useContext, useEffect, useState, useRef } from 'react'
import { BLACK, RED, URL, WHITE } from '../constants/constants'
import { UserTypes, user } from '../../App'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { showMessage } from 'react-native-flash-message'
import Item from '../subComponents/historyItem'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useAsyncStorage } from "@react-native-async-storage/async-storage"
import NetInfo from "@react-native-community/netinfo"
import Loader from 'react-native-spinkit'


interface response {
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
  const [isLoading, setIsLoading] = useState(false)

  const isUpToDate = useRef(false)

  const userData = useContext(user as Context<UserTypes>)

  const { height } = useWindowDimensions()
  
  const { getItem, setItem } = useAsyncStorage(`user_${userData.id}_history`)


  async function fetchData(isConnected: boolean) {
    if ( isUpToDate.current ) return
    if ( isConnected ) { 
      setIsLoading(true)
      axios.get(`${URL}/init/invoices/${userData.companyName}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      })
      .then( (r: AxiosResponse) => {
        setItems((r.data as response).payments.map( (p, i) => 
          <Item token={userData.token} invoiceID={p.invoiceID} date={p.paidAt} amount={p.total} setPdf={setPdf} key={`${p.invoiceID}${i}`}/>
        ))
        setItem(JSON.stringify(r.data))
        isUpToDate.current = true
      })
      .catch((e: any) => {
        if (e instanceof AxiosError) 
          showMessage({
            message: e.response?.data.message,
            type: 'danger'
          })
        if ( e.response == undefined ) 
          showMessage({
            message: 'Network Error',
            type: 'warning'
          })
      })
      .finally(() => setIsLoading(false))
      return
    }

    setIsLoading(true)
    getItem()
    .then( d => {
      if ( d == null ) return
      const data = JSON.parse(d) as response
      setItems(data.payments.map( (p, i) => 
        <Item token={userData.token} invoiceID={p.invoiceID} date={p.paidAt} amount={p.total} setPdf={setPdf} key={`${p.invoiceID}${i}`}/>
      ))
    })
    .finally(() => setIsLoading(false))

  }


  useEffect( () => {
    const unsubscribe = NetInfo.addEventListener(state => {
        fetchData(!!state.isConnected)
    })   

    return( ()=> unsubscribe())
  }, [])

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

  return (
    pdf == null ?
      isLoading 
      ?
        loader
      : 
        content
      : pdf
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