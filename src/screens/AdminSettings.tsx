import { View, ScrollView, useColorScheme, TouchableOpacity, StyleSheet } from 'react-native'
import React, { Context, useContext, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { UserTypes, user } from '../../App'
import AdminProductBox from '../subComponents/adminProduct'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { BLACK, WHITE } from '../constants/constants'
import EditProductBox  from '../subComponents/editProduct'

interface response {
      token?: string,
      products: productProps[]
  }

interface imageResponse {
    token?: string,
    image: string
}


interface  productProps {
  id: number,
  name: string,
  description: string,
  companyID: number,
  cost: number,
  amount: number
}

function ProductWithImage({ product, visible, setVisible, productToDisplay, setProductToDisplay }: {product: productProps, visible: boolean, setVisible: any, productToDisplay: any, setProductToDisplay: any}) {
    const [image, isLoading, isError] = useFetch<imageResponse>(`/products/init/${product.id}`, `product_${product.id}_image`);
    const productWithImage = { ...product, image };
    return <AdminProductBox product={productWithImage} visible={visible} setVisible={setVisible} productToDisplay={productToDisplay} setProductToDisplay={setProductToDisplay} />;
  }

export default function Market() {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)
  const [data, isLoading, isError] = useFetch<response>('/products/init', `user_${userData.id}_market`)
  const [visible, setVisible] = useState(false);
  const [productToDisplay, setProductToDisplay] = useState({} as any);

  const styles = StyleSheet.create({
    button: {
      backgroundColor: WHITE,
      padding: 10,
      alignItems: 'center'
    }
  });

  const handleNewButton = () => {
    setVisible(true)
    setProductToDisplay(null)
  }

  return (
    <>
    <ScrollView>
    {data?.products.sort((a, b) => a.id - b.id).map(product => (
      <ProductWithImage key={product.id} product={product} visible={visible} setVisible={setVisible} productToDisplay={productToDisplay} setProductToDisplay={setProductToDisplay} />
    ))}
  </ScrollView>
  <View>
    {!visible && <TouchableOpacity style={styles.button} onPress={handleNewButton}>
    <AntDesign name="pluscircleo" color={BLACK} size={40} />
  </TouchableOpacity>}
  </View>
  {visible && <EditProductBox product={productToDisplay} visible={visible} setVisible={setVisible} />}
  </>
  )
}
