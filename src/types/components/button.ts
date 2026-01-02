import {
    StyleProp,
    TextStyle,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';
import { ISpacing } from '../theme';
import { IBlockProps } from './block';

export interface ButtonProps
    extends IBlockProps,
        TouchableOpacityProps,
        ISpacing {
    mode?: 'text' | 'outlined' | 'contained';
    dark?: boolean;
    compact?: boolean;
    color?: string;
    buttonColor?: string;
    textColor?: string;
    textSize?: number;
    loading?: boolean;
    icon?: string;
    disabled?: boolean;
    children: React.ReactNode;
    uppercase?: boolean;
    size?: 'normal' | 'small';
    onPress?: () => void;
    contentStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
}
