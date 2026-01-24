import { SCREEN_HEIGHT } from '@/constant';
import { useTheme } from '@/theme';
import {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

export const useAnimation = () => {
    const { colors } = useTheme();
    const backgroundColor = useSharedValue(0);
    const logoText = useSharedValue(0);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                backgroundColor.value,
                [0, 1],
                ['#fddba3ff', '#fddba3ff'],
            ),
            width: interpolate(
                backgroundColor.value,
                [0, 1],
                [0, SCREEN_HEIGHT * 1.5],
            ),
            height: interpolate(
                backgroundColor.value,
                [0, 1],
                [0, SCREEN_HEIGHT * 1.5],
            ),
            borderRadius: (SCREEN_HEIGHT * 1.5) / 2,
        };
    });
    const animatedLogoTextStyle = useAnimatedStyle(() => {
        return {
            display: logoText.value > 0 ? 'flex' : 'none',
            marginBottom: interpolate(logoText.value, [0, 1], [0, 25]),
        };
    });
    return {
        backgroundColor,
        animatedContainerStyle,
        logoText,
        animatedLogoTextStyle,
    };
};
