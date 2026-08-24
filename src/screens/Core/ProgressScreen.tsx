import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { t } from '../../utils/i18n';

const ProgressScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('nav.progress')}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold' }
});

export default ProgressScreen;
