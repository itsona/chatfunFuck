import React, {useEffect, useState} from 'react';
import {View, TouchableWithoutFeedback, StyleSheet, Keyboard, Platform} from 'react-native';
import {Card, TextInput, Button} from "react-native-paper";
import {Axios} from "../JS/axios";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import navigationService from "../JS/navigation.service";
import {debounce} from "../JS/variables";

const MainScreen = () => {
    const [user, setUser] = useState('')
    const [tableId, setTableId] = useState('')
    //TODO ავარჩევინოთ რამდენი კაცი ითამაშებს /მინ /მაქს. სახელი. ღიაა თუ დახურული, და პაროლი


    //TODO შემოვიდა, ჩაწერა სახელი.
    // აგდებს ორ ვერსიას.
    // დაჯოინება და უთითებს პაროლს
    // შექმნა: რენდომ რიცხვი ამოუგდო პაროლად და დაჯოინდა ავტომატურად.
    const loadData = async () => {
        const user = JSON.parse(await asyncStorage.getItem('user_info')) || null
        if(!user) {
            Axios.POST('/register', {name}).then((user) => {
                asyncStorage.setItem('user_info', JSON.stringify(user))
                setUser(user?.name || '')
            })
            return
        }
        setUser(user?.name || '')
    }
    useEffect(() => {
        loadData()
    }, []);

    const createTable = async () => {

        const table = await Axios.POST('/create-table')
        await joinTable(table)
    }
    const joinTable = async (id) => {
        try {
            const table = await Axios.POST('/join-table',
                {
                    tableId: id,
                }
            )
            navigationService.navigate('TablesScreen', {tableId: table.tableId})
        } catch (e) {
            console.log(e)
        }
    }

    const onRegister = async (name) => {
        setUser(name)
        updateDebounce(name)
    }
    const onUserUpdate = async (name) => {
        Axios.PUT('/modify-user', {name}).then((user) => {
            asyncStorage.setItem('user_info', JSON.stringify(user))
        }).catch(console.warn)
    }

    const updateDebounce = debounce(onUserUpdate, 1000)

    return (
        <TouchableWithoutFeedback onPress={Platform.OS !== 'web' ?Keyboard.dismiss : ()=>{}} accessible={false}>
            <View style={styles.mainView}>
            <Card style={[styles.mainCard]}>
                <Card.Content>
                    <TextInput mode={'outlined'}
                               label={'სახელი'}
                               onChangeText={onRegister}
                               value={user}
                               style={{marginBottom: 12}}></TextInput>
                    <TextInput mode={'outlined'} label={'მაგიდის ნომერი'} keyboardType={'numeric'} onChangeText={setTableId}
                               value={tableId}
                               onSubmitEditing={() => joinTable(tableId)}
                    ></TextInput>
                    <View style={styles.right}>
                        <Button  onPress={() => joinTable(tableId)}>შეუერთდი</Button>
                    </View>
                </Card.Content>
                <Card.Actions>
                    <Button onPress={createTable}>შექმნა</Button>
                </Card.Actions>
            </Card>
            </View>
        </TouchableWithoutFeedback>
    );
};
export default MainScreen;
const styles = StyleSheet.create({
    mainView: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    mainCard: {
        backgroundColor: 'white',
        width: '80%',
    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    elevation: {
        elevation: 10,
        shadowColor: '#52006A',
    },
    input: {
        borderColor: 'rgb(0,0,0)',
        borderStyle: "solid",
        borderWidth: 0.2,
        borderRadius: 4,
    },
    right: {
        alignItems: 'flex-end'
    },
    joinTitle: {
        paddingTop: 12,
        color: '#21005d'
    }
})
