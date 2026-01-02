/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import {
    Image,
    I18nManager,
    ImageSourcePropType,
    ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';
import MaterialCommunityIcon, {
    accessibilityProps,
} from './MaterialCommunityIcon';
import { isImageSource } from './utils';

import Text from '../Text/Text';
import Block from '../Block/Block';

type IconSourceBase = string | ImageSourcePropType;

export type IconSource =
    | IconSourceBase
    | Readonly<{ source: IconSourceBase; direction: 'rtl' | 'ltr' | 'auto' }>
    | ((props: IconProps & { color: string }) => React.ReactNode);

type IconProps = {
    size: number;
};

type Props = IconProps & {
    color?: string;
    isText?: boolean;
    source: any;
    style?: ViewStyle;
};

function Icon({ source, color, size = 22, isText = false, ...rest }: Props) {
    const { colors } = useTheme();
    const direction =
        typeof source === 'object' && source.direction && source.source
            ? source.direction === 'auto'
                ? I18nManager.isRTL
                    ? 'rtl'
                    : 'ltr'
                : source.direction
            : null;
    const s =
        typeof source === 'object' && source.direction && source.source
            ? source.source
            : source;
    const iconColor = color || colors?.text;

    if (isImageSource(s)) {
        return (
            <Image
                source={s}
                style={[
                    {
                        transform: [{ scaleX: direction === 'rtl' ? -1 : 1 }],
                    },
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                        width: size + 6,
                        height: size + 6,
                        borderRadius: size + 6,
                        backgroundColor: color,
                        tintColor: color,
                        resizeMode: 'contain',
                    },
                ]}
                {...accessibilityProps}
                {...rest}
            />
        );
    }
    if (isText) {
        return (
            <Block align="center" justify="center">
                <Text color={iconColor} marginTop={size / 2} size={size}>
                    {s}
                </Text>
            </Block>
        );
    }
    if (typeof s === 'string') {
        return (
            <MaterialCommunityIcon
                name={s}
                color={iconColor}
                size={size}
                direction={direction}
            />
        );
    }
    return null;
}

export default Icon;
