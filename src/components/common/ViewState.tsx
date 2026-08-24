import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { t } from '../../utils/i18n';

interface ViewStateProps {
    isLoading?: boolean;
    error?: string | null;
    isEmpty?: boolean;
    onRetry?: () => void;
    emptyMessage?: string;
    children: React.ReactNode;
}

export const ViewState: React.FC<ViewStateProps> = ({
    isLoading,
    error,
    isEmpty,
    onRetry,
    emptyMessage,
    children,
}) => {
    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.message}>{t('common.loading')}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                {onRetry && (
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryText}>{t('common.save')} {/* should be retry, let's use retry in i18n later */}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    if (isEmpty) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.message}>{emptyMessage || t('common.empty')}</Text>
            </View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    retryText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
