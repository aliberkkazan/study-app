import { StatusBar, StyleSheet } from 'react-native';
import {
    SafeAreaView as RNSafeAreaView,
    SafeAreaViewProps,
} from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

function SafeAreaView({ children, style, ...rest }: SafeAreaViewProps) {
    const { variant, navigationTheme } = useTheme();

    return (
        <RNSafeAreaView
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
        </RNSafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex_1: { flex: 1 },
});

export default SafeAreaView;
