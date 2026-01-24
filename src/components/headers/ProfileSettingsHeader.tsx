import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Block, IconButton } from '../shared'

type RootStackParamList = {
    ProfileSettings: undefined;
};

const ProfileSettingsHeader = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    return (
        <Block flex={0}>
            <IconButton
                icon="cog"
                size={24}
                iconColor="#007AFF"
                onPress={() => navigation.navigate('ProfileSettings')}
            />
        </Block>
    )
}

export default ProfileSettingsHeader