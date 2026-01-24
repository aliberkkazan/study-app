/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */
import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';

import Icon, { IconSource } from '../Icon/Icon';

export type Props = {
    icon: IconSource;
    color?: string;
    style?: StyleProp<ViewStyle>;
};

const ICON_SIZE = 28;

function ListIcon({ icon, color: iconColor, style }: Props) {
    return (
        <View style={[styles.item, style]}>
            <Icon source={icon} size={ICON_SIZE} color={iconColor} />
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        margin: 8,
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

ListIcon.displayName = 'List.ListIcon';

export default ListIcon;
