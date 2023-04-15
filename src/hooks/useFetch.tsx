import { useState, useEffect, useContext } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import { user } from '../../App'
import axios, { AxiosError } from 'axios'
import { URL } from '../constants/constants'
import { showMessage } from 'react-native-flash-message'


export default function useFetch<t> (url: string, asyncStorageURL:string ): [t | undefined, boolean, boolean] {
    const [data, setData] = useState<t>()
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    const userData = useContext(user)!

    const { getItem, setItem } = useAsyncStorage(asyncStorageURL)

    async function fetchOnline() {
        try {
            const r = await axios.get(`${url.includes(URL) ? '' : URL}${url}`, {
                headers: {
                    Authorization: `Bearer ${userData.token}`
                }
            })

            const data = r.data as t
            setData(data)
            setItem(JSON.stringify(data))
        }
        catch(e: any) {
            if ( e.response == undefined ) 
                showMessage({
                message: 'Network Error',
                type: 'warning'
                })
            else if (e instanceof AxiosError && e.response.data.message != undefined ) 
                showMessage({
                message: e.response?.data.message,
                type: 'danger'
            })
        }
        finally {
            setIsLoading(false)
        }
    }

    async function fetchOffline() {
        setIsLoading(true)
        try {
            const d = await getItem()
            if ( d == null ) return

            const data = JSON.parse(d) as t
            setData(data)
        }
        catch(e: any) {
            showMessage({
                message: 'Failed To Load Data From Memory',
                type: 'danger'
            })
            setIsError(true)
        }
        finally {
            setIsLoading(false)
        }
    }

    useEffect( () => {
        let wasOnline = false
        const unsubscribe = NetInfo.addEventListener(state => {
            if ( state.isConnected && state.isInternetReachable ) {
                setIsLoading(true)
                setTimeout( ()=> fetchOnline(), 1000)
                wasOnline = true
            }

            if ( !state.isConnected && !state.isInternetReachable && !wasOnline ) {
                fetchOffline()
            }
        })   

        return( ()=> unsubscribe())
    }, [url])

    return [data, isLoading, isError]
}