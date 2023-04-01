import { TouchableOpacity } from "react-native"
import React from "react"
import Icon from "react-native-vector-icons/Ionicons";
import { WHITE } from "../../App";

interface props {
  navigation: any
}

export default function CartNavigation({ navigation }: props) {
  return (
    <TouchableOpacity style={{ paddingRight: 30 }} onPress={() => navigation.navigate('Cart')}>
      <Icon name="md-cart-outline" color={WHITE} size={40} />
    </TouchableOpacity>
  )
}
