/* eslint-disable no-nested-ternary */
import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle, FlexStyle } from 'react-native';

import { IBlockProps } from '@/types';
import { useTheme } from '@/theme';

import { KeyboardAwareScrollView } from '../KeyboardAwareScrollView';
import { SafeAreaView } from '../SafeAreaView';
import { ScrollView } from '../ScrollView';

const Block = React.memo(
    ({
        children,
        style,
        shadow,
        card,
        center,
        outlined,
        overflow,
        row,
        safe,
        keyboard,
        scroll,
        color,
        primary,
        secondary,
        tertiary,
        black,
        white,
        gray,
        danger,
        warning,
        success,
        info,
        radius,
        height,
        width,
        margin,
        marginBottom,
        marginTop,
        marginHorizontal,
        marginVertical,
        marginRight,
        marginLeft,
        padding,
        paddingBottom,
        paddingTop,
        paddingHorizontal,
        paddingVertical,
        paddingRight,
        paddingLeft,
        justify,
        align,
        flex = 1,
        wrap,
        position,
        right,
        left,
        top,
        bottom,
        ...rest
    }: IBlockProps) => {
        const { colors, sizes } = useTheme();

        const colorIndex = useMemo(
            () =>
                primary
                    ? 'primary'
                    : secondary
                      ? 'secondary'
                      : tertiary
                        ? 'tertiary'
                        : black
                          ? 'black'
                          : white
                            ? 'white'
                            : gray
                              ? 'gray'
                              : danger
                                ? 'danger'
                                : warning
                                  ? 'warning'
                                  : success
                                    ? 'success'
                                    : info
                                      ? 'info'
                                      : null,
            [
                primary,
                secondary,
                tertiary,
                black,
                white,
                gray,
                danger,
                warning,
                success,
                info,
            ],
        );

        const blockColor = useMemo(
            () => color || (colorIndex ? colors?.[colorIndex] : undefined),
            [color, colorIndex, colors],
        );

        const blockStyles = useMemo(
            () =>
                StyleSheet.flatten([
                    {
                        ...(shadow && {
                            shadowColor: colors.shadow,
                            shadowOffset: {
                                width: 0,
                                height: 4,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }),
                        ...(card && {
                            backgroundColor: colors.card,
                            borderRadius: sizes.cardRadius,
                            padding: sizes.cardPadding,
                        }),
                        ...(margin !== undefined && { margin }),
                        ...(marginBottom && { marginBottom }),
                        ...(marginTop && { marginTop }),
                        ...(marginHorizontal && { marginHorizontal }),
                        ...(marginVertical && { marginVertical }),
                        ...(marginRight && { marginRight }),
                        ...(marginLeft && { marginLeft }),
                        ...(padding !== undefined && { padding }),
                        ...(paddingBottom && { paddingBottom }),
                        ...(paddingTop && { paddingTop }),
                        ...(paddingHorizontal && { paddingHorizontal }),
                        ...(paddingVertical && { paddingVertical }),
                        ...(paddingRight && { paddingRight }),
                        ...(paddingLeft && { paddingLeft }),
                        ...(radius && { borderRadius: radius }),
                        ...(height && { height }),
                        ...(width && { width }),
                        ...(overflow && { overflow }),
                        ...(flex !== undefined && { flex }),
                        ...(row && { flexDirection: 'row' as const }),
                        ...(align && {
                            alignItems: align as FlexStyle['alignItems'],
                        }),
                        ...(center && { justifyContent: 'center' as const }),
                        ...(justify && {
                            justifyContent:
                                justify as FlexStyle['justifyContent'],
                        }),
                        ...(wrap && {
                            flexWrap: wrap as FlexStyle['flexWrap'],
                        }),
                        ...(blockColor && { backgroundColor: blockColor }),
                        ...(outlined && {
                            borderWidth: 1,
                            borderColor: blockColor,
                        }),
                        ...(position && { position }),
                        ...(right !== undefined && { right }),
                        ...(left !== undefined && { left }),
                        ...(top !== undefined && { top }),
                        ...(bottom !== undefined && { bottom }),
                    } as ViewStyle,
                    style,
                ]) as ViewStyle,
            [
                shadow,
                colors.shadow,
                card,
                colors.card,
                sizes.cardRadius,
                sizes.cardPadding,
                margin,
                marginBottom,
                marginTop,
                marginHorizontal,
                marginVertical,
                marginRight,
                marginLeft,
                padding,
                paddingBottom,
                paddingTop,
                paddingHorizontal,
                paddingVertical,
                paddingRight,
                paddingLeft,
                radius,
                height,
                width,
                overflow,
                flex,
                row,
                align,
                center,
                justify,
                wrap,
                blockColor,
                outlined,
                position,
                right,
                left,
                top,
                bottom,
                style,
            ],
        );

        const renderMap = useMemo(
            () => ({
                safe: () => (
                    <SafeAreaView style={{flexGrow: 1}}>
                        <View style={blockStyles}>
                            {children}
                        </View>
                    </SafeAreaView>
                ),
                keyboard: () => (
                    <KeyboardAwareScrollView
                        contentContainerStyle={blockStyles}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        {...rest}>
                        {children}
                    </KeyboardAwareScrollView>
                ),
                scroll: () => (
                    <ScrollView
                        contentContainerStyle={blockStyles}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        {...rest}>
                        {children}
                    </ScrollView>
                ),
                default: () => (
                    <View {...rest} style={blockStyles}>
                        {children}
                    </View>
                ),
            }),
            [blockStyles, children, rest],
        );

        const key = safe
            ? 'safe'
            : keyboard
              ? 'keyboard'
              : scroll
                ? 'scroll'
                : 'default';
        const Component = renderMap[key];
        return Component();
    },
);

export default Block;
