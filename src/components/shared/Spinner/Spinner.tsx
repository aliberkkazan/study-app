import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
    size?: number;
    strokeWidth?: number;
    color?: string;
};

function Spinner({ size = 24, strokeWidth = 3, color = '#ffffff' }: Props) {
    const rotation = useSharedValue(0);
    const progress = useSharedValue(0.2);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 1000,
                easing: Easing.linear,
            }),
            -1,
            false,
        );

        progress.value = withRepeat(
            withTiming(0.8, {
                duration: 800,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            -1,
            true,
        );
    }, []);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedCircleProps}
                />
            </Svg>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Spinner;
