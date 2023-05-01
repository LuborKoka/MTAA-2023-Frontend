import React, { useEffect, useState } from 'react';
import { useColorScheme, Dimensions ,ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Button } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BLACK, DARKER_WHITE, LIGHTER_BLACK } from '../constants/constants';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome'

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

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

const MAX_CHARACTERS = 200;

const EditableTextbox = ({ text, setText }) => {

  const onChangeText = (newText) => {
    if (newText.length <= MAX_CHARACTERS) {
      setText(newText);
    }
  };

  const styles = StyleSheet.create({
    textInput: {
        borderWidth: 1,
        borderColor: 'black',
    }});

  return (
    <View>
        <Text>Product description</Text>
      <TextInput style={styles.textInput}
        value={text}
        onChangeText={onChangeText}
        multiline
      />
      <Text>
        {text.length}/{MAX_CHARACTERS}
      </Text>
    </View>
  );
};


const EditableTextInput = ({ header, text, setText, isNumeric = false }) => {

    const onChangeText = (newText) => {
      if (!isNumeric || /^\d*$/.test(newText)) {
        setText(newText);
      }
    };
  
    return (
      <View>
        <Text>{header}</Text>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          multiline
          style={styles.textInput}
          underlineColorAndroid="transparent"
          keyboardType={isNumeric ? 'numeric' : 'default'}
        />
        <View style={styles.underline} />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    textInput: {
      fontSize: 16,
      textAlignVertical: 'top',
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },
    underline: {
      borderBottomColor: '#ccc',
      borderBottomWidth: 1,
    },
  });

export default function EditProductBox({product, visible, setVisible} : ProductBoxProps) {
    const isDark = useColorScheme() === 'dark'

    if(!product){
        product = {
            id: 0,
            name: '',
            description: '',
            companyID: 0,
            cost: 0,
            amount: 0,
            image: ''
    }}

    const [productName, setProductName] = useState(product.name);
    const [productDescription, setProductDescription] = useState(product.description);
    const [productCost, setProductCost] = useState(product.cost.toString());
    const [productAmount, setProductAmount] = useState(product.amount.toString());
    const [productImage, setProductImage] = useState('');

    const handleImageUpload = async () => {
        launchImageLibrary({
          useBase64: true
        }, response => {
          if(response && response.assets[0]){
            console.log(response.assets[0].uri);
          }
          });
      };

    const handleCameraUpload = async () => {
       launchCamera({
          useBase64: true
       }, response => {
          if(response && response.assets[0]){
            console.log(response.assets[0].uri);
          }
          });
      };

    if (!visible) {
        return null;
      }
    
      const styles = StyleSheet.create({
        container: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: windowHeight * 0.5,
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
            justifyContent: 'flex-end',
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
            <Text style={styles.headerText}>Edit product details</Text>
          </View>
          <View style={styles.col}>
        <View style={styles.row}>
            <View style={styles.col}>
                <Image style={styles.image} source={{ uri: product.image }} />
                <View style={styles.row}>
                <Button color={DARKER_WHITE} title="Upload" onPress={handleImageUpload}/>
               <TouchableOpacity onPress={handleCameraUpload}>
                <FontAwesome name="camera" color={BLACK} size={50} />
                </TouchableOpacity>
                </View>
            </View>
            <View style={styles.col}>
            <EditableTextInput header="Product name" text={productName} setText={setProductName} />
            <EditableTextInput header="Total amount" text={productAmount} setText={setProductAmount} isNumeric={true} />
            <EditableTextInput header="Price per one piece" text={productCost} setText={setProductCost} isNumeric={true} />
            </View>
            </View>
            <View style={styles.row}>
            <EditableTextbox text={productDescription} setText={setProductDescription}/>
            </View>
            <View style={styles.row}>
                </View>
                <View style={styles.row}>
                <View style={styles.buttonContainer}>
                <Button color={DARKER_WHITE} title="Save" onPress={() => {}}/>
                </View>
                </View>
            </View>
        </View>
      );
}


