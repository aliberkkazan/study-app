/* eslint-disable react/require-default-props */
import React from 'react';
import { Text } from 'react-native';

import { useTheme } from '@/theme';

interface Props {
    size?: number;
    color?: string | null;
}

function LogoText({ color = null }: Props) {
    const { colors } = useTheme();
    return (
        <Text
            style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: color || colors.primary,
            }}>
            Study App
        </Text>
    );
}

export default LogoText;
