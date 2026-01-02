/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react/require-default-props */
import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';

import color from 'color';

import { useTheme } from '@/theme';
import Text from './Text';
import { $Omit } from 'src/types';

type Props = $Omit<
    $Omit<React.ComponentProps<typeof Text>, 'padding'>,
    'type'
> & {
    type?: 'error' | 'info';
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
};

function HelperText({ style, type = 'info', ...rest }: Props) {
    const { colors, variant } = useTheme();

    const textColor =
        type === 'error'
            ? colors?.danger
            : color(colors?.text)
                  .alpha(variant === 'dark' ? 0.7 : 0.54)
                  .rgb()
                  .string();
    return (
        <Text
            style={[
                styles.text,
                styles.padding,
                {
                    color: textColor,
                },
                style,
            ]}
            {...rest}>
            {rest.children}
        </Text>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 11,
        paddingVertical: 4,
    },
    padding: {
        paddingHorizontal: 12,
    },
});

export default HelperText;
