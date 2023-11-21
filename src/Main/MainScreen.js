import React, {useEffect, useState} from 'react';
import {View, Button, FlatList, Text, TouchableOpacity, TextInput} from 'react-native';
import {Axios} from "../JS/axios";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import navigationService from "../JS/navigation.service";

const MainScreen = () => {
    const [tables, setTables] = useState([]);
    const [socket, setSocket] = useState(null)
    const [user, setUser] = useState(null)
    //TODO ავარჩევინოთ რამდენი კაცი ითამაშებს /მინ /მაქს. სახელი. ღიაა თუ დახურული, და პაროლი


    //TODO შემოვიდა, ჩაწერა სახელი.
    // აგდებს ორ ვერსიას.
    // დაჯოინება და უთითებს პაროლს
    // შექმნა: რენდომ რიცხვი ამოუგდო პაროლად და დაჯოინდა ავტომატურად.

    const connectAgain=()=> {
        const ws = new WebSocket('ws://192.168.1.146:3000'); // Replace with your server IP
        ws.onmessage = (event) => {
            if (event.data) {
                const newData = JSON.parse(event.data)
                //         setTables(newData);
                //         if(newData.status === 'created') {
                //             ws.send(JSON.stringify({
                //                 isJoin: true,
                //                 tableId: newData.tableId,
                //             }))
                //         }
                if(newData.message === 'updated-tables') {
                    setTables(newData.data)
                }
                //
            }
        }
        // };
        setSocket(ws)
    }
    const getTables = ()=> {
        Axios.GET('/tables').then(setTables).catch(console.warn)
        connectAgain()
    }
    const loadData = async ()=> {
        getTables();
        const user = JSON.parse(await asyncStorage.getItem('user_info')) || null
        setUser(user?.name || '')
    }
    useEffect(() => {
        // connectAgain()
        loadData()
    }, []);

    const createTable= async()=>{

        const table = await Axios.POST('/create-table')
        await joinTable(table)
    }
    const joinTable= async (id)=>{
        const table = await Axios.POST('/join-table',
            {
                tableId: id,
            }
        )
        navigationService.navigate('TablesScreen', {tableId: table.tableId})
    }
    const onRegister = async (name)=> {
        setUser(name)
        const user = JSON.parse(await asyncStorage.getItem('user_info'))
        if(user){
            await Axios.PUT('/modify-user', {name}).then(async (user)=>{
                await asyncStorage.setItem('user_info', JSON.stringify(user))
            }).catch(console.warn)
            return
        }
        await Axios.POST('/register', {name }).then(async (user)=>{
            await asyncStorage.setItem('user_info', JSON.stringify(user))
        })
    }
    return (
        <View style={{height: '100%', paddingTop: 100,}}>
            <TextInput placeholder={'name'} onChangeText={onRegister} value={user}></TextInput>
            <FlatList
                data={tables}
                keyExtractor={(item) => item.tableId}
                renderItem={({ item }) => <TouchableOpacity onPress={()=> joinTable(item.tableId)}>
                    <Text>{item.usersList?.map(item=> item.name)} {item.tableId}</Text>
                </TouchableOpacity>
                }
            />

            <Button title={'Create'} onPress={createTable}
                styles={{paddingBottom: 24, marginBottom: 24}}
            >
            </Button>
            <Button title={'Reload'} onPress={getTables}></Button>
        </View>
    );
};

export default MainScreen;
