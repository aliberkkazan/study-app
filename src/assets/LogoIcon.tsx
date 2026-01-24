/* eslint-disable react/require-default-props */
import React from 'react';
import { Image } from 'react-native';

// @ts-ignore
import logo from './LogoIcon.png';

interface Props {
    size?: number;
    color?: string;
}

function LogoIcon({ size = 24 }: Props) {
    return (
        <Image
            source={logo}
            style={{ width: size, height: size }}
            resizeMode="contain"
        />
    );
}

export default LogoIcon;
