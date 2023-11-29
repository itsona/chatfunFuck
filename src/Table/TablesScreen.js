import React, {useEffect, useState} from 'react';
import {View, Button, FlatList, Text, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import {Axios} from "../JS/axios";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import navigationService from "../JS/navigation.service";

const TablesScreen = ({route}) => {
    //TODO ელოდება მინიმალური რაოდენობის შევსებას. ვკითხოთ დავიწყოთ თუ არა.
    //TODO თეიბლის აიდის მიხედვით,
    //TODO ყველას გავუგზავნო ამ აიდით ვინცაა რო შემოვიდნენ.
    //TODO თუ უარი თქვეს დაწყების ღილაკი დავუტოვოთ, და ვინც თანხმობა მისცა იმას დეფოლტად ქონდეს ჩართული.
    //TODO



    //TODO შევიდა ზევით უჩანს მაგიდის კოდი.
    //TODO შემოსული ხალხის სახელები/რაოდენობა
    // ქვემოთ უჩანს დაწყება
    // დაჯოინდდა, ამასსაც უჩანს რაოდენობა სახელები, მაგიდის კოდი.
    // ვინც შექმნა ის იწყებს ჩატს. ლიდერს თავზე ექნება გვირგვინივით.
    // (თეიბლს აქვს ლიდერის ფროფერთი, რომელიც იუზერის უნიკალური აიდია)
    // შემქნელს 5 დასაწყისი დანარჩენებს, 5 პასუხი
    // (მოთამაშეების რაოდენობას გავამრავლებ 5ზე ამოვიღებ ამდენ რენდომ კარტს და მერე ამას დავარენდომებ).
    // დააჭირა დაწყებას: ბექში გაეგზავნა, ბექში 20 წამში გაეშვება ფუნქცია (რენდომ კარტის), თუ მანამდე მოუვიდა ბექს რომ აირჩია ლიდერმა ეს წამზომი გაითიშება, და პირდაპირ გაეშვება იუზერის არჩეული ბარათი.
    // ირჩევს ლიდერი 20 წამში დასაწყისს (ბარათების სიაში დააჭირა ერთერთს. გაეგზავნა ბექენდს მერე სოკეტით ყველა მოთამაშეს.)
    // როცა მიუვა მაშინ იწყება იუზერების იგივე ლოგიკით წამზომი 20 წამიანი
    // თუ არადა რენდომად ირჩევს პროგრამა.
    // დანარჩენებზეც იგივე ლოგიკა.
    // აირჩია მოპასუხემ ბარათი, და სქრინზე უჩანს 1 კითხვა 1 პასუხი დიდად.
    // ყველა თუ აირჩევს ანახებს კარტებს ერთმანეთს.
    // უნდა დააჭიროს ლიდერმა გახსნას.(გახსნის შემთხვევაში ყველას უნდა გაეხსნას) ამოუგდოს პასუხების სიას, და აირჩიოს ახალი ლიდერი. და წავა ეს ლუპში.

    const [cards, setCards] = useState([]);
    const [tableDetails, setTableDetails] = useState({});
    const [socket, setSocket] = useState(null)
    const [conversation, setConversation] = useState(null)
    const [user, setUser] = useState({})
    const [isLeader, setIsLeader] = useState(false)
    const [opened, setOpened] = useState(false)
    useEffect(()=> {
        setIsLeader(tableDetails.leadUser === user._id)
    }, [tableDetails])
    const connectAgain=()=> {
        const ws = new WebSocket('ws://192.168.1.146:3000'); // Replace with your server IP
        ws.onmessage = (event) => {
            if (event.data) {
                const newData = JSON.parse(event.data)
                //         setMessages(newData);
                //         if(newData.status === 'created') {
                //             ws.send(JSON.stringify({
                //                 isJoin: true,
                //                 tableId: newData.tableId,
                //             }))
                //         }
                if(newData.message === 'updated-tables') {
                    setMessages(newData.data)
                }
                //
            }
        }
        // };
        setSocket(ws)

    }
    const loadData = async ()=> {
        try {
            const user = JSON.parse(await asyncStorage.getItem('user_info')) || null
            setUser(user || {})
            const table = await Axios.GET('/table?table_id=' + route.params.tableId)
            setTableDetails(table)
            table.cardsList.forEach(item=> {
                if('start' in item){
                    setConversation(item)
                }
            })
            const ws = new WebSocket('ws://192.168.1.146:3000');
            setSocket(ws)
            ws.onopen = ()=> {
                setSocket(ws)
                ws.send(JSON.stringify({type: 'join-table',tableId: table.tableId, user,}))
            }
            ws.onmessage = (event)=> {
                const data = JSON.parse(event.data)
                if(data.type === 'new-join'){
                    setTableDetails(data.table)
                }
                if(data.type === 'cards'){
                    setConversation(null)
                    setCards(data.cards)
                }if(data.type === 'start-conversation'){
                    setTableDetails(data.table)
                    setConversation({start: data.card})
                }if(data.type === 'open-table'){
                    setOpened(true)
                    setTableDetails(data.table)
                }if(data.type === 'choose-leader'){
                    setOpened(false)
                    setTableDetails(data.table)
                    setConversation(null)
                    setCards([])
                }
            }
        }catch (e) {
            console.log(e)
        }
    }


    const openCards = ()=> {
        socket.send(JSON.stringify({type: 'open-cards', tableId: tableDetails.tableId}))
    }

    const chooseCards = (card)=> {
        const type = isLeader ? 'start-conversation' : 'set-answer'
        socket.send(JSON.stringify({type, tableId: tableDetails.tableId, card,user}))
        setCards([card])
    }

    const startGame= ()=> {
        setConversation(null)
        socket.send(JSON.stringify({type: 'start-game',tableId: tableDetails.tableId, userId: user._id}))
    }
    useEffect(() => {
        // connectAgain()
        loadData()
    }, []);

    const chooseLeader = (userId)=> {
        socket.send(JSON.stringify({type: 'choose-leader',tableId: tableDetails.tableId, userId}));
    }


    return (
        <ScrollView style={{height: '100%', backgroundColor: 'rgba(180,170,190,0.05)'}}>
            <View>
                <Text>{tableDetails?.tableId}
                </Text>
                {tableDetails?.usersList?.map(player=> (
                    <View key={player._id} style={{flexDirection: 'row'}}>
                        <Text>{player.name}</Text>

                        {tableDetails.leadUser === player._id && (<Text> Is Lead </Text>)}
                    </View>))}
            </View>
            {isLeader && !opened && !conversation && (
                <TouchableOpacity onPress={startGame}>
                    <Text>Start Game</Text>
                </TouchableOpacity>
            )}

            {conversation && (<>
                <View style={styles.chatSender}>
                    <Text style={{fontSize: 16}}>
                        {conversation.start}
                    </Text>
                </View>
                {!isLeader && cards.length > 1 && cards.map((card)=> (
                    <TouchableOpacity style={styles.chatReceiver} key={card} onPress={()=> chooseCards(card)}>
                        <Text style={{color: 'white', fontSize: 16}}>{card}</Text>
                    </TouchableOpacity>

                ))}
                {!opened && !isLeader && cards.length === 1 && (<>
                    <View style={styles.chatReceiver} key={cards[0]}>
                        <Text style={{color: 'white', fontSize: 22}}>{cards[0]}</Text>
                    </View>
                </>)}
            </>)}
            {isLeader && !conversation && cards.map((card, index)=> (
                <TouchableOpacity style={styles.chatSender} key={index} onPress={()=> chooseCards(card)}>
                    <Text style={{ fontSize: 16}}>{card}</Text>
                </TouchableOpacity>
            ))}

            {isLeader && !opened && conversation && (<TouchableOpacity onPress={openCards}>
                <Text>Open Answers</Text>
            </TouchableOpacity>)}

            {opened && tableDetails.cardsList.map((card, index)=> (card.card && (<>
                <TouchableOpacity style={styles.chatReceiver} key={card.userId} onPress={()=> chooseLeader(card.userId)}>
                    <Text style={{color: 'white', fontSize: 16}}>{card.userName}: {card.card}</Text>
                </TouchableOpacity>
            </>)))}

        </ScrollView>
    );
};

const styles ={
    chatSender:{
        padding: 24,
        marginTop: 24,
        marginLeft:24,
        marginRight: 80,
        backgroundColor: 'rgb(255,255,255)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
    },
    chatReceiver:{
        padding: 24,
        marginTop: 24,
        marginLeft:80,
        marginRight: 24,
        textColor: 'rgb(255,255,255)',
        color: 'rgb(255,255,255)',
        backgroundColor: 'rgba(100,100,255, 0.9)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 24,
    }
}
export default TablesScreen;
