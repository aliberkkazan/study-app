/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */
import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';

import color from 'color';

import { useTheme } from '@/theme';
import { Text } from '../Text';

export type Props = React.ComponentProps<typeof Text> & {
    style?: StyleProp<TextStyle>;
};

function ListSubHeader({ style, ...rest }: Props) {
    const theme = useTheme();
    const textColor = color(theme?.colors?.text).alpha(0.54).rgb().string();

    return (
        <Text
            numberOfLines={1}
            {...rest}
            style={[
                styles.container,
                {
                    color: textColor,
                    fontFamily: theme?.fonts?.normal,
                },
                style,
            ]}
        />
    );
}

ListSubHeader.displayName = 'List.ListSubHeader';

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
});

export default ListSubHeader;
