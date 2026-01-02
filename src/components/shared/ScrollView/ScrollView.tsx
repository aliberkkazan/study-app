import {
    StatusBar,
    ScrollView as RNScrollView,
    ScrollViewProps,
    StyleSheet,
} from 'react-native';

import { useTheme } from '@/theme';

function ScrollView({ children, style, ...rest }: ScrollViewProps) {
    const { variant, navigationTheme } = useTheme();

    return (
        <RNScrollView
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
        </RNScrollView>
    );
}

const styles = StyleSheet.create({
    flex_1: { flex: 1 },
});

export default ScrollView;
