import { ScrollView, useColorScheme, View, Dimensions} from 'react-native'
import React, { Context, useContext, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { UserTypes, user } from '../../App'
import ProductBox from '../subComponents/marketProduct'
import ProductRollUpWindow from '../subComponents/productDetailsWindow'
import Loader from 'react-native-spinkit'
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

const { height } = Dimensions.get('window');

function ProductWithImage({ product, visible, setVisible, productToDisplay, setProductToDisplay }: {product: any, visible: boolean, setVisible: any, productToDisplay: any, setProductToDisplay: any}) {
    const [image, isLoading, isError] = useFetch<imageResponse>(`/products/init/${product.id}`, `product_${product.id}_image`);
    const productWithImage = { ...product, image };
    return <ProductBox product={productWithImage} visible={visible} setVisible={setVisible} productToDisplay={productToDisplay} setProductToDisplay={setProductToDisplay} />;
  }

export default function Market() {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)
  const [data, isLoading, isError] = useFetch<response>('/products/init', `user_${userData.id}_market`)
  const [visible, setVisible] = useState(false);
  const [productToDisplay, setProductToDisplay] = useState({} as any);

  const loader = (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: height - 100, backgroundColor: isDark ? BLACK : WHITE}}>
      <Loader type='Circle' color={isDark ? WHITE : BLACK} size={120} />
    </View> 
  )

  return ( isLoading ? loader :
    <>
    <ScrollView scrollEnabled={!visible}>
    {data?.products.sort((a, b) => a.id - b.id).map(product => (
      <ProductWithImage key={product.id} product={product} visible={visible} setVisible={setVisible} productToDisplay={productToDisplay} setProductToDisplay={setProductToDisplay} />
    ))}
  </ScrollView>
  <ProductRollUpWindow product={productToDisplay} visible={visible} setVisible={setVisible} />
  </>
  )
}
