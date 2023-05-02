import { ScrollView, useColorScheme, View, Dimensions} from 'react-native'
import React, { Context, useContext, useState, useEffect } from 'react'
import useFetch from '../hooks/useFetch'
import { UserTypes, user } from '../../App'
import ProductBox from '../subComponents/marketProduct'
import ProductRollUpWindow from '../subComponents/productDetailsWindow'
import Loader from 'react-native-spinkit'
import { BLACK, WHITE } from '../constants/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

function ProductWithImage({ product, visible, setVisible, productToDisplay, setProductToDisplay, cart, setCart }: {product: any, visible: boolean, setVisible: any, productToDisplay: any, setProductToDisplay: any, cart: any, setCart: any}) {
    const [image, isLoading, isError] = useFetch<imageResponse>(`/products/init/${product.id}`, `product_${product.id}_image`);
    const productWithImage = { ...product, image };
    return <ProductBox product={productWithImage} visible={visible} setVisible={setVisible} productToDisplay={productToDisplay} setProductToDisplay={setProductToDisplay} cart={cart} setCart={setCart} />;
  }

export default function Market() {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)
  const [data, isLoading, isError] = useFetch<response>('/products/init', `user_${userData.id}_market`)
  const [visible, setVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);

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
    
  }, []);

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
      <ProductWithImage key={product.id} product={product} visible={visible} setVisible={setVisible} productToDisplay={productToDisplay} setProductToDisplay={setProductToDisplay} cart={cartItems} setCart={setCartItems}/>
    ))}
  </ScrollView>
  <ProductRollUpWindow product={productToDisplay} visible={visible} setVisible={setVisible} />
  </>
  )
}
