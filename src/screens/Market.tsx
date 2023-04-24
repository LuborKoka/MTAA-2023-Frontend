import { ScrollView, useColorScheme } from 'react-native'
import React, { Context, useContext } from 'react'
import useFetch from '../hooks/useFetch'
import { UserTypes, user } from '../../App'
import ProductBox from '../subComponents/marketProduct'

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

function ProductWithImage({ product }) {
    const [image, isLoading, isError] = useFetch<imageResponse>(`/products/init/${product.id}`, `product_${product.id}_image`);
    const productWithImage = { ...product, image };
    return <ProductBox product={productWithImage} />;
  }

export default function Market() {
  const isDark = useColorScheme() === 'dark'
  const userData = useContext(user as Context<UserTypes>)
  const [data, isLoading, isError] = useFetch<response>('/products/init', `user_${userData.id}_market`)

  return (
    <ScrollView>
    {data?.products.sort((a, b) => a.id - b.id).map(product => (
      <ProductWithImage key={product.id} product={product} />
    ))}
  </ScrollView>
  )
}
