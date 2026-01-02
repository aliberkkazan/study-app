/* eslint-disable react-native/no-inline-styles */

import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import color from 'color';

import { useTheme } from '@/theme';
import { Block } from '../Block';
import { Icon } from '../Icon';
import { ActivityIndicator } from '../ActivityIndicator';
import { Text } from '../Text';
import { TouchableHighlight } from '../TouchableHighlight';
import { getButtonColors } from './utils';
import { ButtonProps } from 'src/types';


const iconSize = 16;

const Button = React.memo(
    ({
        disabled,
        compact = false,
        mode = 'contained',
        dark = false,
        loading,
        icon,
        buttonColor: customButtonColor,
        textColor: customTextColor,
        textSize,
        children,
        onPress,
        style,
        uppercase = false,
        contentStyle,
        labelStyle,
        size = 'normal',
        ...rest
    }: ButtonProps) => {
        const theme = useTheme();
        const borderRadius = useMemo(() => theme.sizes.buttonRadius, [theme]);

        const { backgroundColor, borderColor, textColor, borderWidth } =
            useMemo(
                () =>
                    getButtonColors({
                        customButtonColor,
                        customTextColor,
                        theme,
                        mode,
                        disabled,
                        dark,
                    }),
                [
                    customButtonColor,
                    customTextColor,
                    theme,
                    mode,
                    disabled,
                    dark,
                ],
            );

        const rippleColor = useMemo(
            () => color(theme.colors.primary).alpha(0.42).rgb().string(),
            [theme],
        );

        const buttonStyle = useMemo(
            () => ({
                backgroundColor,
                borderColor,
                borderWidth,
                borderRadius,
            }),
            [backgroundColor, borderColor, borderWidth, borderRadius],
        );

        const { color: customLabelColor, fontSize: customLabelSize } = useMemo(
            () => StyleSheet.flatten(labelStyle) || {},
            [labelStyle],
        );

        const iconStyle = useMemo(
            () =>
                StyleSheet.flatten(contentStyle)?.flexDirection ===
                'row-reverse'
                    ? [styles.iconReverse]
                    : [styles.icon],
            [contentStyle],
        );

        const textStyle = useMemo(
            () => ({
                ...styles.label,
                marginVertical: size === 'normal' ? 10 : 5,
                color: textColor,
                fontFamily: theme?.fonts?.medium,
                ...(compact && styles.compactLabel),
                ...(uppercase && styles.uppercaseLabel),
                ...(labelStyle as object),
            }),
            [
                styles.label,
                size,
                textColor,
                theme?.fonts?.medium,
                compact,
                uppercase,
                labelStyle,
            ],
        );

        return (
            <TouchableHighlight
                borderless
                onPress={onPress}
                disabled={disabled}
                rippleColor={rippleColor}
                delayPressIn={0}
                style={[
                    styles.button,
                    compact && styles.compact,
                    buttonStyle,
                    style,
                ]}>
                <Block
                    flex={0}
                    style={[styles.content, contentStyle]}
                    {...rest}>
                    {icon && loading !== true ? (
                        <Block flex={0} style={iconStyle}>
                            <Icon
                                source={icon}
                                size={customLabelSize ?? iconSize}
                                color={
                                    typeof customLabelColor === 'string'
                                        ? customLabelColor
                                        : textColor
                                }
                            />
                        </Block>
                    ) : null}
                    {loading ? (
                        <ActivityIndicator
                            size={customLabelSize ?? iconSize}
                            color={
                                typeof customLabelColor === 'string'
                                    ? customLabelColor
                                    : textColor
                            }
                            style={[iconStyle, { marginVertical: 13 }]}
                        />
                    ) : (
                        <Text
                            size={textSize}
                            selectable={false}
                            numberOfLines={1}
                            style={textStyle}>
                            {children}
                        </Text>
                    )}
                </Block>
            </TouchableHighlight>
        );
    },
);

const styles = StyleSheet.create({
    button: {
        minWidth: 64,
        borderStyle: 'solid',
    },
    compact: {
        minWidth: 100,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginLeft: 12,
        marginRight: -4,
    },
    iconReverse: {
        marginRight: 12,
        marginLeft: -4,
    },
    label: {
        textAlign: 'center',
        letterSpacing: 1,
        marginHorizontal: 16,
    },
    compactLabel: {
        marginHorizontal: 8,
    },
    uppercaseLabel: {
        textTransform: 'uppercase',
    },
});

export default Button;
