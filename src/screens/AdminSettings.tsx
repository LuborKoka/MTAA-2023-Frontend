import { View, Text, useColorScheme } from 'react-native'
import React, { Context, useContext, useEffect, useState } from 'react'
import useFetch from '../hooks/useFetch'

export default function AdminSettings() {
  const isDark = useColorScheme() === 'dark'
  return (
    <View>
      <Text>Admin Settings
      </Text>
    </View>
  )
}