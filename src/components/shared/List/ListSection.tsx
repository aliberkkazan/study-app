/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */
import React from 'react';
import {
    View,
    ViewStyle,
    StyleSheet,
    StyleProp,
    TextStyle,
} from 'react-native';
import ListSubHeader from './ListSubHeader';

export type Props = React.ComponentPropsWithRef<typeof View> & {
    title?: string;
    children: React.ReactNode;
    titleStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
};

function ListSection({ children, title, titleStyle, style, ...rest }: Props) {
    return (
        <View {...rest} style={[styles.container, style]}>
            {title ? (
                <ListSubHeader style={titleStyle}>{title}</ListSubHeader>
            ) : null}
            {children}
        </View>
    );
}

ListSection.displayName = 'List.Section';

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
    },
});

export default ListSection;
