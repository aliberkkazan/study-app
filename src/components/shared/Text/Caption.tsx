/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */
import * as React from 'react';
import { Text, TextStyle, StyleSheet, StyleProp } from 'react-native';

import Typography from './Text';

export type Props = React.ComponentProps<typeof Text> & {
    style?: StyleProp<TextStyle>;
    color?: string;
    children: React.ReactNode;
};

function Caption(props: Props) {
    return (
        <Typography
            {...props}
            opacity={0.54}
            family="regular"
            style={[styles.text, props.style]}
        />
    );
}

export default Caption;

const styles = StyleSheet.create({
    text: {
        fontSize: 12,
        lineHeight: 20,
        marginVertical: 2,
        letterSpacing: 0.4,
    },
});
