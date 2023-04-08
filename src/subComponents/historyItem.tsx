import React, {useEffect, useRef, useState} from 'react'
import RNFetchBlob from 'rn-fetch-blob'
import { useColorScheme, View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Entypo'
import ADIcon from 'react-native-vector-icons/AntDesign'
import FIcon from 'react-native-vector-icons/Fontisto'
import { showMessage } from 'react-native-flash-message'
import { WHITE, BLACK, URL, RED } from '../constants/constants'
import PDFView from 'react-native-pdf'
import { formatNumber } from './Account'
import Loader from 'react-native-spinkit'



interface itemProps {
  token: string,
  invoiceID: string,
  date: string,
  amount: number,
  setPdf: React.Dispatch<React.SetStateAction<JSX.Element | null>>
}

  
function Item({ token, invoiceID, date, amount, setPdf }: itemProps) {
  const isDark = useColorScheme() === 'dark'

  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {config, fs} = RNFetchBlob
  const downloadsDir = fs.dirs.DownloadDir

  const filePath = useRef(`${downloadsDir}/${encodeURIComponent(invoiceID)}.pdf`)


  useEffect( () => {
    fs.exists(filePath.current)
    .then((exists) => {
      if ( exists ) setIsDownloaded(true)
    })
    //tuto realne nechcem ani nic robit, ale hadzalo to warning possible unhandled promise rejection abo daco take
    .catch()

  }, [invoiceID])

  async function download() {
    if ( isLoading ) return
    const url = `${URL}/invoices/${encodeURIComponent(invoiceID)}`
    setIsLoading(true)
    try {
        const response = await config({
            fileCache: true,
            path: `${downloadsDir}/${encodeURIComponent(invoiceID)}.pdf`,
        }).fetch('GET', url, {
            Authorization: `Bearer ${token}`,
        })

        filePath.current = response.path()
        showMessage({
          message: 'Download Complete',
          type: 'success'
        })
        setIsDownloaded(true)
    } catch (e: any) {
        showMessage({
            message: 'Download Failed'
        })
        setIsDownloaded(false)
    }
    finally {
      setIsLoading(false)
    }
  }

  function displayPDF() {
    const src = {uri: `file://${filePath.current}`}
    setPdf(
      <View style={style.pdfContainer}>
        <PDFView source={src} style={style.pdf} scale={1} minScale={1} />
        <TouchableOpacity style={style.close} onPress={() => setPdf(null)}>
          <ADIcon name='closesquareo' style={{color: BLACK, fontSize: 20}} />
        </TouchableOpacity>
      </View>
    )
  }

  async function deletePDF() {
    try {
      await fs.unlink(filePath.current)
      setIsDownloaded(false)
    } catch(e: any) {
      showMessage({
        message: 'Failed To Delete The File',
        type: 'danger'
      })
    }
  }

  return (
    <View style={{...style.paymentHeader, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: isDark ? WHITE : BLACK, borderStyle: 'dashed'}}>
        <Text style={{color: isDark ? WHITE : BLACK, width: (Dimensions.get('window').width-40) * .40}}>{date}</Text>
        <Text style={{color: isDark ? WHITE : BLACK, width: (Dimensions.get('window').width-40) * .35}}>{formatNumber(amount)}</Text>
        <TouchableOpacity style={{width: (Dimensions.get('window').width-40) * .10, justifyContent: 'center', flexDirection: 'row'}} onPress={isDownloaded ? displayPDF : download}>
          { isDownloaded ?
          <ADIcon name='pdffile1' style={{color: isDark ? WHITE : BLACK, fontSize: 24}}  /> :
          isLoading ? <Loader type='Circle' color={isDark ? WHITE : BLACK} size={24}  /> : <Icon name='download' style={{color: isDark ? WHITE : BLACK, fontSize: 24}} />
          }
        </TouchableOpacity>
        { isDownloaded ?
        <TouchableOpacity style={{width: (Dimensions.get('window').width-40) * .10, justifyContent: 'flex-end', flexDirection: 'row'}} onPress={deletePDF}>
          <FIcon name='trash' style={{color: RED, fontSize: 24}} />
        </TouchableOpacity> : null 
        }
      </View>
  )
}

const style = StyleSheet.create({
  paymentHeader: {
      alignItems: 'center',
      flexDirection: 'row'
  },
  pdfContainer: {
    flex: 1
  },
  pdf: {
      flex:1,
      backgroundColor: 'white',
      paddingTop: 0
  },
  close: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 5
  }
})

export default Item