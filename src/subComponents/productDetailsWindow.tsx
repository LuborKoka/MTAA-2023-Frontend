import React from 'react';
import { Dimensions ,ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Button } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BLACK, DARKER_WHITE, WHITE } from '../constants/constants';
import { ProductDetails } from './cartProduct';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

interface productProps{
    product: {
    id: number,
    name: string,
    description: string,
    companyID: number,
    cost: number,
    amount: number,
    image: string
    },
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const TextBox = () => {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.text}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas feugiat sollicitudin magna, vel varius justo facilisis id. Fusce ut venenatis tellus. Quisque ultricies, libero et pulvinar ultrices, sem nulla malesuada velit, at vulputate neque diam vel nibh.
          </Text>
        </ScrollView>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      padding: 10,
      backgroundColor: '#fff',
    },
    scrollContainer: {
      flexGrow: 1,
      width: 0.50 * windowWidth,
      justifyContent: 'flex-start',
    },
    text: {
      fontSize: 12
    },
  });  

const ProductRollUpWindow = ({ product, visible, setVisible }: productProps) => {
  if (!visible) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: windowHeight * 0.4,
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 0,
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
    },
    closeButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
    },
    headerText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    content: {
      flex: 1,
      marginTop: 20,
      alignItems: 'center',
    },
    box: {
      width: '100%',
      height: 60,
      borderRadius: 10,
      backgroundColor: '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    boxText: {
      fontSize: 14,
      color: 'black',
    },
    removeButton: {
      position: 'absolute',
      top: 0,
      right: 0
    },
    col: {
        flexDirection: 'column'
    },
    row: {
        flexDirection: 'row'
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        alignItems: 'flex-start',
    },
    image: {
        width: 130,
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
    },
    description: {
        fontSize: 16,
        color: 'black',
        alignItems: 'flex-start',
        paddingLeft: 10
    },
    buttonContainer: {
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    button: {
        backgroundColor: DARKER_WHITE
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity style={styles.removeButton} onPress={() => setVisible(false)}>
        <FontAwesome name="close" color={BLACK} size={25} />
      </TouchableOpacity>
        <Text style={styles.headerText}>Product details</Text>
      </View>
      <View style={styles.col}>
      <View style={styles.row}>
        <Text style={styles.productName}>{product.name}</Text>
    </View>
    <View style={styles.row}>
            <Image style={styles.image} source={{ uri: product.image }} />
            <TextBox/>
        </View>
        <View style={styles.row}>
            <ProductDetails product={product} totalAmount={0}/>
            </View>
            <View style={styles.row}>
            <View style={styles.buttonContainer}>
            <Button color={DARKER_WHITE} title="CONTACT SELLER" onPress={() => {}}/>
            <Button color={DARKER_WHITE} title="ADD TO CART" onPress={() => {}}/>
            </View>
            </View>
        </View>
    </View>
  );
};

export default ProductRollUpWindow;
