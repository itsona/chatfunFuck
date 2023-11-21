import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from "./src/Main/MainScreen";
import {NavigationContainer} from '@react-navigation/native';
import TablesScreen from "./src/Table/TablesScreen";
import {_navigator} from "./src/JS/navigation.service";

const Stack = createStackNavigator();

const App = () => {
    return <NavigationContainer ref={_navigator}>
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
            }}>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="TablesScreen" component={TablesScreen} />
        </Stack.Navigator>
    </NavigationContainer>
};

export default App;
