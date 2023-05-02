import { View, Text, ScrollView, useColorScheme, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import React, { Context, useContext, useState, useEffect } from 'react'
import useFetch from '../hooks/useFetch'
import { UserTypes, user } from '../../App'
import CartProductBox from '../subComponents/cartProduct'
import { BLACK, WHITE, DARKER_WHITE } from '../constants/constants'
import RollUpWindow from '../subComponents/selectPaymentWindow'
import Loader from 'react-native-spinkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { showMessage } from 'react-native-flash-message'
import axios from 'axios'

interface response {
  token?: string,
  products: {
    id: number,
    name: string,
    description: string,
    companyID: number,
    amount: number,
    cost: number
  }[]
}

interface ProductProps {
  id: number,
  name: string,
  description: string,
  companyID: number,
  cost: number,
  amount: number,
  image: string
}

interface imageResponse {
  token?: string,
  image: string
}

const { height } = Dimensions.get('window');

function ProductWithImage({ product, cart, setCart }: { product: any, cart: any, setCart: any }) {
  const [image, isLoading, isError] = useFetch<imageResponse>(`/products/init/${product.id}`, `product_${product.id}_image`);
  const productWithImage = { ...product, image };
  return <CartProductBox product={productWithImage} cart={cart} setCart={setCart}/>;
}

const getCompanyId = async (user : UserTypes) => {
  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
  }

  const body = JSON.stringify({
      companyName : user.companyName
  })

  const response = await axios.post(`${URL}/company/init`, body, {headers})
  return response.data.data.companyID;
}

const getCompanyAmount = async (user : UserTypes) => {
  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
  }

  const body = JSON.stringify({
      companyName : user.companyName
  })

  const response = await axios.post(`${URL}/company/info`, body, {headers})
  return parseFloat(response.data.data.amount);
}

const getCompanyIban = async (user : UserTypes) => {
  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
  }

  const body = JSON.stringify({
      companyName : user.companyName
  })

  const response = await axios.post(`${URL}/company/info`, body, {headers})
  return response.data.data.iban;
}

export default function Cart() {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)
  const [data, isLoading, isError] = useFetch<response>('/products/init', `user_${userData.id}_market`)
  const [visible, setVisible] = useState(false);
  const [cartItems, setCartItems] = useState<ProductProps>();
  const [companyId, setCompanyId] = useState<number>();
  const [companyAmount, setCompanyAmount] = useState<number>();
  const [textItems, setTextItems] = useState([]);


  useEffect(() => {
    getCompanyId(userData).then((id) => {
        setCompanyId(id)
    })
    getCompanyAmount(userData).then((amount) => {
      setCompanyAmount(amount)
  })
  getCompanyIban(userData).then((iban) => {
    setTextItems(iban)
})
}, [])



  useEffect(() => {
    async function loadCart() {
      try {
        const cartData = await AsyncStorage.getItem(`cart_${userData.id}`);
        if (cartData !== null) {
          setCartItems(JSON.parse(cartData));
        } else {
          setCartItems([]);
          await AsyncStorage.setItem(`cart_${userData.id}`, JSON.stringify([]));
        }
      } catch (error) {
        console.log(error);
      }
    }
    loadCart();
    //setIsLoading(false);
  }, []);


  const styles = StyleSheet.create({
    button: {
      backgroundColor: WHITE,
      padding: 10,
      alignItems: 'center',
      flex: 0
    },
    line: {
      borderBottomColor: 'black',
      borderBottomWidth: 1,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    totalText: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
    },
    orderButton: {
      backgroundColor: DARKER_WHITE,
      padding: 10,
      borderRadius: 5,
    },
    orderButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: BLACK}
  });

  const totalAmount = data?.products.reduce((acc, product) => acc + product.cost, 0).toFixed(2);
 
  const handleOrderButton = () => {
    setVisible((prevVisible) => !prevVisible);
    if(data?.products.length === 0) {
      showMessage({
        message: 'Cart is empty',
        type: 'danger',
      });
    }

    if(companyAmount < parseFloat(totalAmount)) {
      showMessage({
        message: 'Not enough money on account',
        type: 'danger',
      });
    }
  };

  const Line = () => { return <View style={styles.line} /> }

  const loader = (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: height - 100, backgroundColor: isDark ? BLACK : WHITE}}>
      <Loader type='Circle' color={isDark ? WHITE : BLACK} size={120} />
    </View> 
  )


  return ( isLoading ? loader :
    <>
      <ScrollView scrollEnabled={!visible}>
        {data?.products.map((product) => (
          <ProductWithImage key={product.id} product={product} cart={cartItems} setCart={setCartItems} />
        ))}
      </ScrollView>
      <Line />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total {totalAmount} €</Text>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderButton}>
          <Text style={styles.orderButtonText}>ORDER</Text>
        </TouchableOpacity>
        <RollUpWindow visible={visible} setVisible={setVisible} texts={textItems} />
      </View>
    </>
  )
}
