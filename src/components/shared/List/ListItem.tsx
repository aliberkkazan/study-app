/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-shadow */
import * as React from 'react';
import {
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

import color from 'color';

import { $RemoveChildren, EllipsizeProp } from '@/types';
import { useTheme } from '@/theme';
import { TouchableHighlight } from '../TouchableHighlight';
import { Text } from '../Text';

type Title =
    | React.ReactNode
    | ((props: {
          selectable: boolean;
          ellipsizeMode: EllipsizeProp | undefined;
          color: string;
          fontSize: number;
      }) => React.ReactNode);

type Description =
    | React.ReactNode
    | ((props: {
          selectable: boolean;
          ellipsizeMode: EllipsizeProp | undefined;
          color: string;
          fontSize: number;
      }) => React.ReactNode);

export type Props = $RemoveChildren<typeof TouchableHighlight> & {
    title: Title;
    description?: Description;
    left?: (props: {
        color: string;
        style: {
            marginLeft: number;
            marginRight: number;
            marginVertical?: number;
        };
    }) => React.ReactNode;
    right?: (props: {
        color: string;
        style?: {
            marginRight: number;
            marginVertical?: number;
        };
    }) => React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    descriptionStyle?: StyleProp<TextStyle>;
    titleNumberOfLines?: number;
    descriptionNumberOfLines?: number;
    titleEllipsizeMode?: EllipsizeProp;
    descriptionEllipsizeMode?: EllipsizeProp;
};

function ListItem({
    left,
    right,
    title,
    description,
    onPress,
    style,
    titleStyle,
    titleNumberOfLines = 1,
    descriptionNumberOfLines = 2,
    titleEllipsizeMode,
    descriptionEllipsizeMode,
    descriptionStyle,
    ...rest
}: Props) {
    const theme = useTheme();
    const renderDescription = (
        descriptionColor: string,
        description?: Description | null,
    ) => {
        return typeof description === 'function' ? (
            description({
                selectable: false,
                ellipsizeMode: descriptionEllipsizeMode,
                color: descriptionColor,
                fontSize: styles.description.fontSize,
            })
        ) : (
            <Text
                selectable={false}
                numberOfLines={descriptionNumberOfLines}
                ellipsizeMode={descriptionEllipsizeMode}
                style={[
                    styles.description,
                    { color: descriptionColor },
                    descriptionStyle,
                ]}>
                {description}
            </Text>
        );
    };

    const renderTitle = () => {
        const titleColor = color(theme?.colors?.text)
            .alpha(0.87)
            .rgb()
            .string();

        return typeof title === 'function' ? (
            title({
                selectable: false,
                ellipsizeMode: titleEllipsizeMode,
                color: titleColor,
                fontSize: styles.title.fontSize,
            })
        ) : (
            <Text
                selectable={false}
                ellipsizeMode={titleEllipsizeMode}
                numberOfLines={titleNumberOfLines}
                style={[styles.title, { color: titleColor }, titleStyle]}>
                {title}
            </Text>
        );
    };

    const descriptionColor = color(theme?.colors?.text)
        .alpha(0.54)
        .rgb()
        .string();

    return (
        <TouchableHighlight
            {...rest}
            style={[styles.container, style]}
            onPress={onPress}>
            <View style={styles.row}>
                {left
                    ? left({
                          color: descriptionColor,
                          style: description
                              ? styles.iconMarginLeft
                              : {
                                    ...styles.iconMarginLeft,
                                    ...styles.marginVerticalNone,
                                },
                      })
                    : null}
                <View style={[styles.item, styles.content]}>
                    {renderTitle()}

                    {description
                        ? renderDescription(descriptionColor, description)
                        : null}
                </View>
                {right
                    ? right({
                          color: descriptionColor,
                          style: description
                              ? styles.iconMarginRight
                              : {
                                    ...styles.iconMarginRight,
                                    ...styles.marginVerticalNone,
                                },
                      })
                    : null}
            </View>
        </TouchableHighlight>
    );
}

ListItem.displayName = 'List.Item';

const styles = StyleSheet.create({
    container: {
        padding: 4,
    },
    row: {
        flexDirection: 'row',
    },
    title: {
        fontSize: 14,
    },
    description: {
        fontSize: 12,
    },
    marginVerticalNone: { marginVertical: 0 },
    iconMarginLeft: { marginLeft: 0, marginRight: 5 },
    iconMarginRight: { marginRight: 0 },
    item: {
        marginVertical: 6,
        paddingLeft: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
});

export default ListItem;
