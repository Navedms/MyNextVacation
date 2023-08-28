import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import Icon from './Icon';

import colors from '../config/colors';

export interface AppButtonProps {
  title?: string;
  onPress?: () => void;
  fontWeight?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  style?: Object;
  disabled?: boolean;
}

function AppButton({
  title,
  onPress,
  fontWeight = 'bold',
  fontSize = 18,
  color = 'white',
  backgroundColor = 'primary',
  icon,
  iconColor = 'white',
  iconSize = 22,
  style,
  disabled,
}: AppButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[
        styles.button,
        {
          backgroundColor: colors[backgroundColor],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={disabled ? undefined : onPress}>
      {icon && (
        <Icon
          name={icon as any}
          size={iconSize}
          iconColor={colors[iconColor]}
          style={styles.icon}
        />
      )}
      {title && (
        <Text
          style={[
            styles.text,
            {
              color: colors[color],
              fontWeight: fontWeight,
              fontSize: fontSize,
            } as Object,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    marginVertical: 10,
  },
  text: {
    textTransform: 'uppercase',
  },
  icon: {
    paddingLeft: 6,
  },
});

export default AppButton;
