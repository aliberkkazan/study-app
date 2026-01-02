/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from 'react';
import { StyleSheet, Text, Platform, TextProps, ViewProps } from 'react-native';

export type IconProps = {
    name: string;
    color?: string;
    size: number;
    direction: 'rtl' | 'ltr';
    allowFontScaling?: boolean;
};

let MaterialCommunityIcons: React.ComponentType<
    TextProps & {
        name: string;
        color: string;
        size: number;
        pointerEvents?: ViewProps['pointerEvents'];
    }
>;

try {
    // Optionally require vector-icons
    MaterialCommunityIcons =
        require('react-native-vector-icons/dist/MaterialCommunityIcons').default;
} catch (e) {
    let isErrorLogged = false;

    // Fallback component for icons
    MaterialCommunityIcons = function ({ color, size, ...rest }) {
        if (!isErrorLogged) {
            if (
                !/(Cannot find module|Module not found|Cannot resolve module)/.test(
                    (e as any).message,
                )
            ) {
                console.error(e);
            }
            isErrorLogged = true;
        }

        return (
            <Text
                {...rest}
                style={[styles.icon, { color, fontSize: size }]}
                // @ts-expect-error: Text doesn't support this, but it seems to affect TouchableNativeFeedback
                pointerEvents="none"
                selectable={false}>
                □
            </Text>
        );
    };
}

export const accessibilityProps =
    Platform.OS === 'web'
        ? {
              role: 'img',
              focusable: false,
          }
        : {
              accessibilityElementsHidden: true,
              importantForAccessibility: 'no-hide-descendants' as const,
          };

const defaultIcon = ({
    name,
    color = 'black',
    size,
    direction,
    allowFontScaling,
}: IconProps) => (
    <MaterialCommunityIcons
        allowFontScaling={allowFontScaling}
        name={name}
        color={color}
        size={size}
        style={[
            {
                transform: [{ scaleX: direction === 'rtl' ? -1 : 1 }],
                lineHeight: size,
            },
            styles.icon,
        ]}
        pointerEvents="none"
        selectable={false}
        {...accessibilityProps}
    />
);

const styles = StyleSheet.create({
    icon: {
        backgroundColor: 'transparent',
    },
});

export default defaultIcon;
