import React, { useEffect, useState, Context, useContext } from 'react';
import { useColorScheme, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { BLACK, DARKER_WHITE, LIGHTER_BLACK, RED, WHITE } from '../constants/constants';
import MatterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { user, UserTypes } from '../../App';
import axios from 'axios';
import { URL } from '../constants/constants';
import { showMessage } from 'react-native-flash-message'

interface ProductBoxProps {
  product: {
    id: number,
    name: string,
    description: string,
    companyID: number,
    cost: number,
    amount: number,
    image: string
  }
  visible: boolean,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  productToDisplay: any,
  setProductToDisplay: React.Dispatch<React.SetStateAction<any>>
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

export default function AdminProductBox({product, visible, setVisible, productToDisplay, setProductToDisplay} : any) {
    const isDark = useColorScheme() === 'dark'
    const userData = useContext(user as Context<UserTypes>) 

    const styles = StyleSheet.create({
      container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: WHITE,
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
      editandDeleteContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
      editButton: {
        backgroundColor: DARKER_WHITE,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15
      },
      editButtonText: {
        color: BLACK,
        fontWeight: "bold",
        fontSize: 14,
        textAlign: "center",
      },
    });
      
    const handleEdit = () => {
      setVisible(true);
      setProductToDisplay(product);
    }

    const handleDelete = async () => {
      const headers = {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userData.token}`
      }

      const reponse = await axios.delete(`${URL}/products/delete/${product.id}`, {headers: headers})
      if(reponse.status === 204) {
        showMessage({ //UAT 8
          message: `Product ${product.name} was deleted successfully`,
          type: 'success'
        })
      }
    }
  
    return (
      <TouchableOpacity style={styles.container}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: product.image }} />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.editandDeleteContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
            <MatterialIcons name="delete" color={RED} size={40} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
}


