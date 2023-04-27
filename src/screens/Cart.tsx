import { View, Text, ScrollView, useColorScheme, TouchableOpacity, StyleSheet } from 'react-native'
import React, { Context, useContext } from 'react'
import useFetch from '../hooks/useFetch'
import { UserTypes, user } from '../../App'
import CartProductBox from '../subComponents/cartProduct'
import { BLACK, WHITE, DARKER_WHITE } from '../constants/constants'

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

interface imageResponse {
  token?: string,
  image: string
}

function ProductWithImage({ product }) {
  const [image, isLoading, isError] = useFetch<imageResponse>(`/products/init/${product.id}`, `product_${product.id}_image`);
  const productWithImage = { ...product, image };
  return <CartProductBox product={productWithImage} />;
}

export default function Market() {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)
  const [data, isLoading, isError] = useFetch<response>('/products/init', `user_${userData.id}_market`)

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

  const totalAmount = data?.products.reduce((acc, product) => acc + product.cost, 0);
  const handleOrderButton = () => {
    console.log('Order button clicked');
  }

  const Line = () => { return <View style={styles.line} /> }

  return (
    <>
      <ScrollView>
        {data?.products.sort((a, b) => a.id - b.id).map(product => (
          <ProductWithImage key={product.id} product={product} />
        ))}
      </ScrollView>
      <Line />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total {totalAmount} €</Text>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderButton}>
          <Text style={styles.orderButtonText}>ORDER</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}
