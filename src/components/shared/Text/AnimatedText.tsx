/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */
import { useTheme } from '@/theme';
import * as React from 'react';
import { Animated, StyleSheet, TextStyle } from 'react-native';

type Props<T> = React.ComponentPropsWithRef<typeof Animated.Text> & {
    variant?: string;
    style?: TextStyle;
};

function AnimatedText({ style, variant, ...rest }: Props<never>) {
    const theme = useTheme();

    return (
        <Animated.Text
            {...rest}
            style={[
                styles.text,
                {
                    fontFamily: theme.fonts.normal,
                    color: theme.colors.text,
                },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    text: {
        textAlign: 'left',
    },
});

export const customAnimatedText = <T,>() =>
    AnimatedText as (props: Props<T>) => JSX.Element;

export default AnimatedText;
