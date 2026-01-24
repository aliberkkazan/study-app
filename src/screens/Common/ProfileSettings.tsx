import React from 'react'
import { Alert, StyleSheet } from 'react-native';
import { Block, List, Divider } from '@/components'
import { useTheme } from '@/theme';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { deleteAccount } from '@/redux/authSlice';

const ProfileSettings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { colors } = useTheme();

    const handleDeleteAccount = () => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
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
                title="Delete my Account"
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