import { View, Text, useColorScheme, StyleSheet, Dimensions } from 'react-native'
import React, { Context, useContext, useEffect, useState } from 'react'
import { BLACK, RED, URL, WHITE } from '../constants/constants'
import { UserTypes, user } from '../../App'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { showMessage } from 'react-native-flash-message'
import Item from '../subComponents/historyItem'
import Icon from 'react-native-vector-icons/FontAwesome'

interface response {
  accounts: {
      iban: string,
      balance: number,
      payments: {
          total: number,
          invoiceID: string,
          isIncoming: boolean,
          paidAt: string
      }[]
  }[]
}


export default function History() {
  const isDark = useColorScheme() === 'dark'

  const [items, setItems] = useState<JSX.Element[]>([])
  const [pdf, setPdf] = useState<JSX.Element | null>(null)

  const userData = useContext(user as Context<UserTypes>)

  useEffect( ()=> {
    axios.get(`${URL}/finances/init/${userData.companyName}`, {
      headers: {
        Authorization: `Bearer ${userData.token}`
      }
    })
    .then( (r: AxiosResponse) => {
      (r.data as response).accounts.forEach( a => {
        setItems( p => [...p, ...a.payments.filter(e => !e.isIncoming).map( (p, i) => {
          return <Item token={userData.token} invoiceID={p.invoiceID} date={p.paidAt} amount={p.total} setPdf={setPdf} key={`${p.invoiceID}${i}`}/>
        })])
      })
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
  }, [])


  return (
    pdf == null ?
    <View style={{backgroundColor: isDark ? BLACK : WHITE, ...style.container}}>
      
      { (items.length === 0) ?
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
    </View>
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