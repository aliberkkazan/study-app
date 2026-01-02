/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import color from 'color';

const getUnderlayColor = ({
    calculatedRippleColor,
    underlayColor,
}: {
    calculatedRippleColor: string;
    underlayColor?: string;
}) => {
    if (underlayColor != null) {
        return underlayColor;
    }
    return color(calculatedRippleColor).fade(0.5).rgb().string();
};

const getRippleColor = ({
    theme,
    rippleColor,
}: {
    theme: any;
    rippleColor?: string;
}) => {
    if (rippleColor) {
        return rippleColor;
    }

    if (theme.variant === 'dark') {
        return color(theme?.colors?.text).alpha(0.32).rgb().string();
    }
    return color(theme?.colors?.text).alpha(0.2).rgb().string();
};

export const getTouchableRippleColors = ({
    theme,
    rippleColor,
    underlayColor,
}: {
    theme: any;
    rippleColor?: string;
    underlayColor?: string;
}) => {
    const calculatedRippleColor = getRippleColor({ theme, rippleColor });
    return {
        calculatedRippleColor,
        calculatedUnderlayColor: getUnderlayColor({
            calculatedRippleColor,
            underlayColor,
        }),
    };
};
