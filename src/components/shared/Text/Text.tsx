import React, { useMemo } from 'react';
import { StyleSheet, Text as RNText, TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import { ITextProps } from '@/types/components/text';
import { ThemeFonts } from '@/types/theme';

function Typography(props: ITextProps) {
    const {
        children,
        style,
        color,
        gradient,
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
        size,
        bold,
        semibold,
        weight,
        h1,
        h2,
        h3,
        h4,
        h5,
        p,
        font,
        align,
        transform,
        lineHeight,
        position,
        right,
        left,
        top,
        bottom,
        marginBottom,
        marginTop,
        marginHorizontal,
        marginVertical,
        marginRight,
        marginLeft,
        paddingBottom,
        paddingTop,
        paddingHorizontal,
        paddingVertical,
        paddingRight,
        paddingLeft,
        center,
        opacity,
        family,
        ...rest
    } = props;
    const { colors, sizes, lines, weights, fonts } = useTheme();

    const textColor = useMemo(() => {
        const colorIndex = primary
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
            : null;
        return color || (colorIndex ? colors?.[colorIndex] : undefined);
    }, [color, primary, secondary, tertiary, black, white, gray, danger, warning, success, info, colors]);

    const getFontFamily = (fontFamily: keyof ThemeFonts | undefined): string => {
        if (fontFamily && fontFamily in fonts) {
            return fonts[fontFamily];
        }
        return fonts.text;
    };

    const textStyle = useMemo(() => {
        const baseStyle: TextStyle = {
            color: colors.text,
            fontSize: typeof size === 'number' ? size : sizes.text,
            lineHeight: typeof lineHeight === 'number' ? lineHeight : lines.text,
            fontFamily: getFontFamily(family),
            fontWeight: weight ? weights[weight as keyof ThemeFonts] : weights.text,
        };

        if (textColor) {
            baseStyle.color = textColor;
        }

        if (h1) {
            baseStyle.fontSize = sizes.h1;
            baseStyle.lineHeight = lines.h1;
            baseStyle.fontWeight = weights.h1;
            baseStyle.fontFamily = fonts.h1;
        }

        if (h2) {
            baseStyle.fontSize = sizes.h2;
            baseStyle.lineHeight = lines.h2;
            baseStyle.fontWeight = weights.h2;
            baseStyle.fontFamily = fonts.h2;
        }

        if (h3) {
            baseStyle.fontSize = sizes.h3;
            baseStyle.lineHeight = lines.h3;
            baseStyle.fontWeight = weights.h3;
            baseStyle.fontFamily = fonts.h3;
        }

        if (h4) {
            baseStyle.fontSize = sizes.h4;
            baseStyle.lineHeight = lines.h4;
            baseStyle.fontWeight = weights.h4;
            baseStyle.fontFamily = fonts.h4;
        }

        if (h5) {
            baseStyle.fontSize = sizes.h5;
            baseStyle.lineHeight = lines.h5;
            baseStyle.fontWeight = weights.h5;
            baseStyle.fontFamily = fonts.h5;
        }

        if (p) {
            baseStyle.fontSize = sizes.p;
            baseStyle.lineHeight = lines.p;
            baseStyle.fontWeight = weights.p;
            baseStyle.fontFamily = fonts.p;
        }

        if (marginBottom) {
            baseStyle.marginBottom = marginBottom;
        }

        if (marginTop) {
            baseStyle.marginTop = marginTop;
        }

        if (marginHorizontal) {
            baseStyle.marginHorizontal = marginHorizontal;
        }

        if (marginVertical) {
            baseStyle.marginVertical = marginVertical;
        }

        if (marginRight) {
            baseStyle.marginRight = marginRight;
        }

        if (marginLeft) {
            baseStyle.marginLeft = marginLeft;
        }

        if (paddingBottom) {
            baseStyle.paddingBottom = paddingBottom;
        }

        if (paddingTop) {
            baseStyle.paddingTop = paddingTop;
        }

        if (paddingHorizontal) {
            baseStyle.paddingHorizontal = paddingHorizontal;
        }

        if (paddingVertical) {
            baseStyle.paddingVertical = paddingVertical;
        }

        if (paddingRight) {
            baseStyle.paddingRight = paddingRight;
        }

        if (paddingLeft) {
            baseStyle.paddingLeft = paddingLeft;
        }

        if (center) {
            baseStyle.textAlign = 'center';
        }

        if (align) {
            baseStyle.textAlign = align;
        }

        if (transform) {
            baseStyle.textTransform = transform;
        }

        if (position) {
            baseStyle.position = position;
        }

        if (right !== undefined) {
            baseStyle.right = right;
        }

        if (left !== undefined) {
            baseStyle.left = left;
        }

        if (top !== undefined) {
            baseStyle.top = top;
        }

        if (bottom !== undefined) {
            baseStyle.bottom = bottom;
        }

        if (opacity !== undefined) {
            baseStyle.opacity = opacity;
        }

        return StyleSheet.create({
            text: baseStyle,
        });
    }, [
        colors.text,
        size,
        lineHeight,
        family,
        weight,
        textColor,
        h1,
        h2,
        h3,
        h4,
        h5,
        p,
        marginBottom,
        marginTop,
        marginHorizontal,
        marginVertical,
        marginRight,
        marginLeft,
        paddingBottom,
        paddingTop,
        paddingHorizontal,
        paddingVertical,
        paddingRight,
        paddingLeft,
        center,
        align,
        transform,
        position,
        right,
        left,
        top,
        bottom,
        opacity,
    ]);

    return (
        <RNText style={[textStyle.text, style]} {...rest}>
            {children}
        </RNText>
    );
}

export default Typography;
