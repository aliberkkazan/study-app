/* eslint-disable react/require-default-props */
import React, { memo, useMemo } from 'react';
import {
    StyleProp,
    TouchableHighlight as RNTouchableHighlight,
    ViewStyle,
    StyleSheet,
} from 'react-native';
import { useTheme } from '@/theme';
import { getTouchableRippleColors } from './utils';

type Props = React.ComponentProps<typeof RNTouchableHighlight> & {
    borderless?: boolean;
    disabled?: boolean;
    onPress?: () => void | null;
    rippleColor?: string;
    padding?: boolean;
    underlayColor?: string;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

const TouchableHighlight = React.memo(
    ({
        style,
        borderless = false,
        disabled: disabledProp,
        rippleColor,
        padding = false,
        underlayColor,
        children,
        ...rest
    }: Props) => {
        const theme = useTheme();
        const disabled = disabledProp || !rest.onPress;
        const { calculatedUnderlayColor } = useMemo(
            () =>
                getTouchableRippleColors({
                    theme,
                    rippleColor,
                    underlayColor,
                }),
            [theme, rippleColor, underlayColor],
        );

        return (
            <RNTouchableHighlight
                {...rest}
                disabled={disabled}
                style={[
                    borderless && styles.overflowHidden,
                    padding && styles.button,
                    style,
                ]}
                underlayColor={calculatedUnderlayColor}>
                {React.Children.only(children)}
            </RNTouchableHighlight>
        );
    },
);

const styles = StyleSheet.create({
    overflowHidden: {
        overflow: 'hidden',
    },
    button: {
        borderRadius: 10,
        padding: 8,
    },
});

export default TouchableHighlight;
