import { ScrollView, useColorScheme, TouchableOpacity, StyleSheet } from 'react-native'
import React, { Context, useContext } from 'react'
import useFetch from '../hooks/useFetch'
import { UserTypes, user } from '../../App'
import AdminProductBox from '../subComponents/adminProduct'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { BLACK, WHITE } from '../constants/constants'
interface response {
      token?: string,
      products: {
        id: number,
        name: string,
        description: string,
        companyID: number,
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
    return <AdminProductBox product={productWithImage} />;
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
    }
  });

  const handleNewButton = () => {
    console.log('new Button clicked');
  }

  return (
    <>
    <ScrollView>
    {data?.products.sort((a, b) => a.id - b.id).map(product => (
      <ProductWithImage key={product.id} product={product} />
    ))}
  </ScrollView>
    <TouchableOpacity style={styles.button} onPress={handleNewButton}>
    <AntDesign name="pluscircleo" color={BLACK} size={40} />
  </TouchableOpacity>
  </>
  )
}
