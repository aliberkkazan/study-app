import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { sendConnectionRequest } from '../../redux/dataSlice';
import { lightTheme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';

export const JoinMentorScreen = () => {
    const [code, setCode] = useState('');
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const { loading } = useSelector((state: RootState) => state.data);

    const handleJoin = async () => {
        if (!code) {
            Alert.alert('Error', 'Please enter a code');
            return;
        }
        
        try {
            await dispatch(sendConnectionRequest(code)).unwrap();
            Alert.alert('Success', 'Request sent successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join a Mentor</Text>
            <Text style={styles.subtitle}>Enter the 6-character code provided by your mentor.</Text>

            <TextInput
                style={styles.input}
                placeholder="Mentor Code (e.g. X92KLP)"
                placeholderTextColor="#999"
                value={code}
                onChangeText={text => setCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
            />

            <TouchableOpacity style={styles.button} onPress={handleJoin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Send Request</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: lightTheme.colors.background,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: lightTheme.colors.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: lightTheme.colors.text, // or a muted color
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.7,
    },
    input: {
        backgroundColor: lightTheme.colors.card,
        padding: 15,
        borderRadius: 10,
        fontSize: 18,
        borderWidth: 1,
        borderColor: lightTheme.colors.border,
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: lightTheme.colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
