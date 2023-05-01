import React, { useEffect, useState } from 'react';
import { useColorScheme, View, Text, TextInput, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { BLACK, DARKER_WHITE, LIGHTER_BLACK, RED } from '../constants/constants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface ProductBoxProps {
  product: {
    id: number,
    name: string,
    description: string,
    companyID: number,
    cost: number,
    image: string,
    amount: number
  }
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

export function ProductDetails({ product, totalAmount }) {
    const [amount, setAmount] = useState(totalAmount);
  
    const handleDecreaseAmount = () => {
      setAmount(amount - 1);
    };
  
    const handleIncreaseAmount = () => {
      setAmount(amount + 1);
    };
    
    const styles = StyleSheet.create({
        totalCostContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 15
        },
        price: {
          fontWeight: 'bold',
          fontSize: 12,
          marginBottom: 8,
        },
        amountContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        amountText: {
          marginRight: 16,
          fontSize: 18,
        },
        buttonsContainer: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        button: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#ddd',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 4,
        },
        buttonText: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
        },
        input: {
          width: 100,
          height: 40,
          borderWidth: 1,
          borderRadius: 4,
          borderColor: '#ddd',
          paddingHorizontal: 8,
          fontSize: 14,
          textAlign: 'center',
          marginHorizontal: 4,
        },
      });

      
    return (
      <View>
        <View style={styles.amountContainer}>
            <View style={styles.totalCostContainer}>
          <Text style={styles.amountText}>{amount * product.cost} €</Text>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableWithoutFeedback onPress={handleDecreaseAmount}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>-</Text>
              </View>
            </TouchableWithoutFeedback>
            <TextInput
              style={styles.input}
              value={amount.toString()}
              onChangeText={(text) => setAmount(parseInt(text) || 0)}
              keyboardType="numeric"
            />
            <TouchableWithoutFeedback onPress={handleIncreaseAmount}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>+</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    );
  }

export default function CartProductBox({product} : ProductBoxProps){
    const isDark = useColorScheme() === 'dark'

    const styles = StyleSheet.create({
      container: {
        flexDirection: "column",
        justifyContent: "center",
        paddingVertical: 10,
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
        borderWidth: 1,
        borderColor: LIGHTER_BLACK
      },
      detailsContainer: {
        flex: 2,
        flexDirection: "column",
        marginLeft: 20,
        textAlign: "top",
      },
      productName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: BLACK
      },
      removeButton: {
        position: 'absolute',
        top: -5,
        right: 10,
      },
      subContainer: {
        flexDirection: "row"
      },
      productCost: {
        fontSize: 12,
        color: LIGHTER_BLACK,
        marginBottom: 5
      }
    });
      
    const handleRemove = () => {
        console.log(`Deleting ${product.name}!`);
    }
  
    return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
         <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <FontAwesome name="close" color={BLACK} size={25} />
      </TouchableOpacity>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: product.image }} />
        </View>
        <View style={styles.detailsContainer}>
            <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCost}>{product.cost} / pc.</Text>
          </View>
        </View>
        <ProductDetails product={product} totalAmount={0} />
  </View>
    )
}


