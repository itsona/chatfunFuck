import React, {useEffect, useState} from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';


const App = () => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [socket, setSocket] = useState(null);

    const connectAgain=()=> {
        const ws = new WebSocket('ws://192.168.1.147:3000'); // Replace with your server IP
        ws.onmessage = (event) => {
            if(event.data) {
                const newMessage = JSON.parse(event.data)
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        };
        const tableInfo = {
            isJoin: true,
            table: '1',
            user: '1',
        }
        // ws.send(JSON.stringify(tableInfo))
        setSocket(ws);
    }
    useEffect(() => {
        connectAgain()
    }, []);
    const sendMessage = () => {
        if (socket && text) {
            const message = { text };
            socket.send(JSON.stringify(message));
            setText('');
        }
    };

    return (
        <View style={{height: '100%'}}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.text}
                renderItem={({ item }) => <Text>{item.text}</Text>}
            />
            <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'end'}}>
            <TextInput
                placeholder={'test'}
                value={text}
                onChangeText={(newText) => setText(newText)}
            />
            <Button
                title="Send"
                onPress={sendMessage}
            />
            <Button title={'refresh'} onPress={connectAgain}></Button>
            </View>
        </View>
    );
};

export default App;
