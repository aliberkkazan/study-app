/* eslint-disable @typescript-eslint/no-use-before-define */
import { StatusBar, StyleSheet } from 'react-native';
import {
    KeyboardAwareScrollViewProps,
    KeyboardAwareScrollView as RNKeyboardAwareScrollView,
} from 'react-native-keyboard-aware-scroll-view';

import { useTheme } from '@/theme';

function KeyboardScreen({
    children,
    style,
    ...rest
}: KeyboardAwareScrollViewProps) {
    const { variant, navigationTheme } = useTheme();

    return (
        <RNKeyboardAwareScrollView
            style={[
                style,
                styles.flex_1,
                { backgroundColor: navigationTheme.colors.background },
            ]}
            {...rest}>
            <StatusBar
                barStyle={variant === 'dark' ? 'light-content' : 'dark-content'}
            />
            {children}
        </RNKeyboardAwareScrollView>
    );
}
const styles = StyleSheet.create({
    flex_1: { flex: 1 },
});

export default KeyboardScreen;
