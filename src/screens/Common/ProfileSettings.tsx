import React from 'react'
import { Alert, StyleSheet } from 'react-native';
import { Block, List, Divider } from '@/components'
import { useTheme } from '@/theme';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { deleteAccount } from '@/redux/authSlice';
import { t } from '../../utils/i18n';

const ProfileSettings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { colors } = useTheme();

    const handleDeleteAccount = () => {
        Alert.alert(
            t('profile.confirmDeletion'),
            t('profile.confirmDeletionMsg'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const resultAction = await dispatch(deleteAccount());
                            if (deleteAccount.fulfilled.match(resultAction)) {
                                console.log('Account deleted successfully');
                            } else {
                                if (resultAction.payload) {
                                    console.log('Delete failed:', resultAction.payload);
                                } else {
                                    console.log('Delete failed with error:', resultAction.error);
                                }
                            }
                        } catch (err) {
                            console.log('Dispatch error:', err);
                        }
                    },
                },
            ],
        );
    };

    return (
        <Block padding={20}>
            <List.Item
                onPress={() => { handleDeleteAccount(); }}
                title={t('profile.deleteAccount')}
                titleStyle={styles.menuItemText}
                left={props => (
                    <List.ListIcon
                        {...props}
                        color={colors.danger as string}
                        icon="account-remove"
                    />
                )}
            />
            <Divider />
        </Block>
    )
}

export default ProfileSettings

const styles = StyleSheet.create({
    menuItemText: {
        color: '#454545ff',
        marginLeft: 10,
        fontSize: 14,
        lineHeight: 26,
    },
});