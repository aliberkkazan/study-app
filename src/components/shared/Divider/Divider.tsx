/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react/require-default-props */
import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

import color from 'color';

import { useTheme } from '@/theme';
import { $RemoveChildren } from '@/types';
import { IBlockProps } from '@/types/components/block';

export type Props = $RemoveChildren<typeof View> &
    IBlockProps & {
        leftInset?: boolean;
        style?: StyleProp<ViewStyle>;
    };

function Divider({ leftInset, style, ...rest }: Props) {
    const { variant } = useTheme();
    const dividerColor = color(variant === 'dark' ? '#fff' : '#000')
        .alpha(0.3)
        .rgb()
        .string();

    return (
        <View
            style={[
                {
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: dividerColor,
                },
                leftInset && styles.leftInset,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    leftInset: {
        marginLeft: 72,
    },
});

export default Divider;
