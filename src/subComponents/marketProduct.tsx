import React, { useEffect, useState } from 'react';
import { useColorScheme, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { BLACK, DARKER_WHITE, LIGHTER_BLACK } from '../constants/constants';
import ProductRollUpWindow from './productDetailsWindow';

interface ProductProps {
  id: number,
  name: string,
  description: string,
  companyID: number,
  cost: number,
  amount: number,
  image: string
}
interface ProductBoxProps {
  product: ProductProps,
  visible: boolean,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  productToDisplay: any,
  setProductToDisplay: React.Dispatch<React.SetStateAction<ProductProps>>
  cart: ProductProps[],
  setCart: React.Dispatch<React.SetStateAction<ProductProps[]>>
}


interface ImageDisplayProps {
  binaryData: string;
}

function ImageDisplay({ binaryData }: ImageDisplayProps) {
  const [imageData, setImageData] = useState('');

  useEffect(() => {
    setImageData(`data:image/jpeg;base64,${binaryData}`);
  }, [binaryData]);

  return <Image source={{ uri: imageData }} style={{ width: 90, height: 90 }} />;
}

export default function ProductBox({product, visible, setVisible, productToDisplay, setProductToDisplay, cart, setCart} : ProductBoxProps) {
    const isDark = useColorScheme() === 'dark'

    const styles = StyleSheet.create({
      container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      imageContainer: {
        flex: 1,
        alignItems: "center",
      },
      image: {
        width: 90,
        height: 90,
        resizeMode: "contain",
      },
      detailsContainer: {
        flex: 2,
        marginLeft: 20,
        justifyContent: "center",
      },
      productName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: BLACK
      },
      productId: {
        fontSize: 12,
        color: "#999",
        marginBottom: 10,
      },
      priceAndBuyContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
      price: {
        fontSize: 16,
        fontWeight: "bold",
        color: BLACK,
      },
      buyButton: {
        backgroundColor: DARKER_WHITE,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginLeft: 10,
      },
      buyButtonText: {
        color: BLACK,
        fontWeight: "bold",
        fontSize: 14,
        textAlign: "center",
      },
    });
      
    const handleBuy = () => {
      let newCart = cart;
      let newProduct : ProductProps= product;
      newProduct.amount = 1;
      newCart.push(newProduct);
      setCart(newCart);
    }

    const handlePress = () => {
      setVisible(!visible);
      setProductToDisplay(product);
      console.log(visible);
    }

    return (
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: product.image }} />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productId}>ID: {product.id}</Text>
          <View style={styles.priceAndBuyContainer}>
            <Text style={styles.price}>${product.cost}</Text>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
              <Text style={styles.buyButtonText}>BUY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
}


