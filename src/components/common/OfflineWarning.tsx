import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { t } from '../../utils/i18n';

export const OfflineWarning: React.FC = () => {
    // In a real app, use @react-native-community/netinfo
    const [isOffline, setIsOffline] = useState(false);

    if (!isOffline) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{t('common.offline')}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ff3b30',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
    },
});
