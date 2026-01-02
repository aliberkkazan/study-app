import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme } from '../../../theme/theme';

interface MentorStudentListCardProps {
    item: {
        id: string;
        name: string;
        email: string;
    };
    onPress: (item: any) => void;
}

export const MentorStudentListCard: React.FC<MentorStudentListCardProps> = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>
            <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: lightTheme.colors.card,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: lightTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: lightTheme.colors.text,
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    arrow: {
        marginLeft: 'auto',
        fontSize: 20,
        color: '#ccc',
    },
});
