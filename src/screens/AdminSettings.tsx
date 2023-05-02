import { View, ScrollView, useColorScheme, TouchableOpacity, StyleSheet, Text, ActivityIndicator, Image } from 'react-native'
import React, { Context, useContext, useEffect, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { UserTypes, user } from '../../App'
import AdminProductBox from '../subComponents/adminProduct'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { BLACK, WHITE } from '../constants/constants'
import EditProductBox  from '../subComponents/editProduct'
import Loader from 'react-native-spinkit'
import { Dimensions } from 'react-native'
import { URL as API_URL} from '../constants/constants' 
import axios from 'axios'
import RNFetchBlob from 'rn-fetch-blob';

interface response {
      token?: string,
      products: productProps[]
  }

interface imageResponse {
    token?: string,
    image: string
}

const { height } = Dimensions.get('window');

interface  productProps {
  id: number,
  name: string,
  description: string,
  companyID: number,
  cost: number,
  amount: number
}



export default function AdminSettings() {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)
  const [data, isLoading, isError] = useFetch<response>('/products/init', `user_${userData.id}_market`)
  const [visible, setVisible] = useState(false);
  const [productToDisplay, setProductToDisplay] = useState({} as any);
  const [refreshCount, setRefreshCount] = useState(0);
  const handleRefresh = () => {
    // do some work here to refresh the data
    console.log('refreshing data')
    setRefreshCount((prevCount) => prevCount + 1);
  };

  async function getImageUrl(productId: number): Promise<string> {
    try {
      const header = {
        'Authorization': `Bearer ${userData.token}`
    }
      const response = await axios.get(`${API_URL}/products/init/${productId}`, { headers: header, responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting image:', error);
      return '';
    }
  }

  function ProductWithImage({ product, visible, setVisible, productToDisplay, setProductToDisplay }: {product: productProps, visible: boolean, setVisible: any, productToDisplay: any, setProductToDisplay: any}) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [image, setImage] = useState('');
  
    useEffect(() => {
      const getImage = async () => {
        try {
          const header = {
            'Authorization': `Bearer ${userData.token}`
        }
          const response = await axios.get(`${API_URL}/products/init/${product.id}`, { headers: header, responseType: 'blob' });
          if (response) {
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            //const base64Image = await RNFetchBlob.fs.readFile(blob, 'base64');
            //const imageUrl = `data:${blob.type};base64,${base64Image}`;
            //console.log(imageUrl)
          }
        } catch (error) {
          console.log(error);
          setImageError(true);
        } finally {
          setImageLoaded(true);
        }
      };
      //getImage();
    }, [product]);
  
    if (imageError) {
      //return <Text>Error loading image</Text>;
    }
  
    if (!imageLoaded) {
      //return <ActivityIndicator />;
    }
  
    const productWithImage = { ...product, image };
    <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />
      return <AdminProductBox product={productWithImage} visible={visible} setVisible={setVisible} productToDisplay={productToDisplay} setProductToDisplay={setProductToDisplay} />;
    }

  const styles = StyleSheet.create({
    button: {
      backgroundColor: isDark ? BLACK : WHITE,
      padding: 10,
      alignItems: 'center'
    }
  });

  const handleNewButton = () => {
    setVisible(true)
    setProductToDisplay(null)
  }

  const loader = (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: height - 100, backgroundColor: isDark ? BLACK : WHITE}}>
      <Loader type='Circle' color={isDark ? WHITE : BLACK} size={120} />
    </View> 
  )

  return ( isLoading ? loader :
    <>
    <ScrollView>
    {data?.products.sort((a, b) => a.id - b.id).map(product => (
      <ProductWithImage key={product.id} product={product} visible={visible} setVisible={setVisible} productToDisplay={productToDisplay} setProductToDisplay={setProductToDisplay}/>
    ))}
  </ScrollView>
  <View>
    {!visible && <TouchableOpacity style={styles.button} onPress={handleNewButton}>
    <AntDesign name="pluscircleo" color={BLACK} size={40} />
  </TouchableOpacity>}
  </View>
  {visible && <EditProductBox product={productToDisplay} visible={visible} setVisible={setVisible} onRefresh={handleRefresh}/>}
  </>
  )
}
