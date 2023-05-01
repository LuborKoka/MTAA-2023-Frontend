import React, { useEffect, useState, useContext, Context } from 'react';
import { useColorScheme, Dimensions ,ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Button } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BLACK, DARKER_WHITE, LIGHTER_BLACK } from '../constants/constants';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome'
import { UserTypes, user } from '../../App'
import { URL } from '../constants/constants';
import axios, { AxiosError } from 'axios'
import { showMessage } from 'react-native-flash-message';

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
  onRefresh: () => void
}


interface ImageDisplayProps {
  binaryData: string;
}

interface companyProps {
  companyID: number
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

const getCompanyId = async (user : UserTypes) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
    }

    const body = JSON.stringify({
        companyName : user.companyName
    })

    const response = await axios.post(`${URL}/company/init`, body, {headers})
    return response.data.data.companyID;
}

export default function EditProductBox({product, visible, setVisible, onRefresh} : ProductBoxProps) {
    const isDark = useColorScheme() === 'dark'
    const userData = useContext(user as Context<UserTypes>)      
    if(!product){
        product = {
            id: -1,
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
    const [companyId, setCompanyId] = useState(-1);
    
    useEffect(() => {
        getCompanyId(userData).then((id) => {
            setCompanyId(id)
        })
    }, [])

    function checkUri(uri: string){
      return uri.endsWith(".jpg")
    }

    const handleImageUpload = async () => {
        launchImageLibrary({
          useBase64: true
        }, response => {
          if(response && response.assets[0]){
            if(!checkUri(response.assets[0].uri)){
              showMessage({ //UAT 10
                message: "Please select a \"jpg\" image",
                type: "warning"
              })
              return;
            }
            setProductImage(response.assets[0].uri);
          }
          });
      };

    const handleCameraUpload = async () => {
       launchCamera({
          useBase64: true
       }, response => {
          if(response && response.assets[0]){
            if(!checkUri(response.assets[0].uri)){
              showMessage({ //UAT 10
                message: "Please select a \"jpg\" image",
                type: "warning"
              })
              return;
            }
            setProductImage(response.assets[0].uri);
          }
          });
      };

    const handleSubmit = async () => {
        const headers = {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userData.token}`
        }

        const form = new FormData()
            form.append('name', productName)
            form.append('description', productDescription)
            form.append('company_id', companyId.toString())
            form.append('cost', productCost)
            form.append('amount', productAmount)
            form.append('image', {
                uri: productImage,
                type: 'image/jpeg',
                name: 'image.jpg'
            })

       if(product.id === -1){
            const response = await axios.post(`${URL}/products/create`, form, {headers})
            if(response.status === 204){
                const d = await AsyncStorage.getItem(`user_${userData.id}_market`)
                showMessage({ //UAT 5
                  message: `Product ${productName} was created successfully`,
                  type: 'success'
                })
                //add product to local storage
                //if(d){
                 //   const data = JSON.parse(d) as ProductProps[]
               //     data.push({
                   //     id: data[data.length - 1].id + 1,
                     //   name: productName,
                       // description: productDescription,
                        //companyID: companyId,
                      //  cost: productCost,
                       // amount: productAmount,
                       // image: productImage
                    //})
                    //await AsyncStorage.setItem(`user_${userData.id}_market`, JSON.stringify(data))
                //}
                setVisible(false)
            }
       }else{
            form.append('id', product.id.toString())
            const response = await axios.put(`${URL}/products/update`, form, {headers})
            console.log(response.data)
            if(response.status === 200){
              showMessage({ //UAT 7
                message: `Product ${product.name} was updated successfully`,
                type: 'success'
              })
                setVisible(false)
            }
       }
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
      const title = product.id === -1 ? "SUBMIT" : "SAVE"
      const header = product.id === -1 ? "Create new product" : "Edit product details"
      return (
        <View style={styles.container}>
          <View style={styles.header}>
          <TouchableOpacity style={styles.removeButton} onPress={() => setVisible(false)}>
            <FontAwesome name="close" color={BLACK} size={25} />
          </TouchableOpacity>
            <Text style={styles.headerText}>{header}</Text>
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
                <Button color={DARKER_WHITE} title={title} onPress={handleSubmit}/>
                </View>
                </View>
            </View>
        </View>
      );
}


