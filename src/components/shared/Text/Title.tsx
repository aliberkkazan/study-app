import * as React from 'react';
import { StyleProp, StyleSheet, TextStyle } from 'react-native';

import Typography from './Text';

export type Props = {
    children: React.ReactNode;
    color?: string;
    style?: StyleProp<TextStyle>;
};

function Title(props: Props) {
    const { style, ...rest } = props;
    const combinedStyle = React.useMemo(() => (
        StyleSheet.flatten([styles.text, style])
    ), [style]);

    return (
        <Typography
            {...rest}
            opacity={0.87}
            family="medium"
            style={combinedStyle}
        />
    );
}

export default Title;

const styles = StyleSheet.create({
    text: {
        fontSize: 20,
        lineHeight: 30,
        marginVertical: 2,
        letterSpacing: 0.15,
    },
});
