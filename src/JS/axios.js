import axios from 'axios';
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
const baseUrl = 'http://188.40.156.182:5000';

// Passing configuration object to axios
export class Axios {
    static async GET(url, params){
        try {
            const {data} = await axios.get(`${baseUrl}${url}`)
            return data
        }catch (e) {
            throw e
        }
    }

    static async POST(url, params = {}){
        const user = JSON.parse(await asyncStorage.getItem('user_info'))
        if(user){
            params.user = user
        }
        try {
            return axios.post(`${baseUrl}${url}`, params).then((response)=> response.data)
        }catch (e) {
            throw e
        }
    }
    static async PUT(url, params = {}){
        const user = JSON.parse(await asyncStorage.getItem('user_info'))
        if(user){
            params.user = user
        }
        try {
            return axios.put(`${baseUrl}${url}`, params).then((response)=> response.data)
        }catch (e) {
            throw e
        }
    }
    static Delete(url, params){
        try {
            return axios.delete(`${baseUrl}${url}`, params).then((response)=> response.data)
        }catch (e) {
            throw e
        }
    }
}
