/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import Animated, {
    Easing,
    Layout,
    runOnJS,
    withTiming,
} from 'react-native-reanimated';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/constant';
import LogoText from '@/assets/LogoText';
import LogoIcon from '@/assets/LogoIcon';

import { useTheme } from '@/theme';

import { Spinner } from '../Spinner';
import { useAnimation } from './Hook';

type Props = {
    onAnimationEnd: () => void;
};
function BootSplash({ onAnimationEnd }: Props) {
    const { colors } = useTheme();
    const {
        backgroundColor,
        animatedContainerStyle,
        logoText,
        animatedLogoTextStyle,
    } = useAnimation();

    const onFinishedSplashAnimation = () =>
        setTimeout(() => onAnimationEnd(), 2000);

    useEffect(() => {
        backgroundColor.value = withTiming(
            1,
            { easing: Easing.ease, duration: 350 },
            finished => {
                if (finished) {
                    logoText.value = withTiming(
                        1,
                        { easing: Easing.bounce, duration: 350 },
                        finished => {
                            'worklet';

                            if (finished) {
                                runOnJS(onFinishedSplashAnimation)();
                            }
                        },
                    );
                }
            },
        );
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.white }]}>
            <Animated.View style={[animatedContainerStyle]} />
            <Animated.View
                style={styles.logoContainer}
                layout={Layout.springify()}>
                <LogoIcon size={SCREEN_HEIGHT / 5} color="white" />
                <Animated.View
                    style={[
                        animatedLogoTextStyle,
                        { marginTop: 0, marginLeft: -10 },
                    ]}>
                    <LogoText size={SCREEN_HEIGHT / 5} color="white" />
                </Animated.View>
            </Animated.View>
            <View style={styles.absolute}>
                <Spinner
                    color={colors.white as string}
                    size={24}
                    strokeWidth={2}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    logoContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    absolute: {
        flex: 1,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 50,
    },
});

export default BootSplash;
