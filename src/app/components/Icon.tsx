import React from 'react';
import {Platform, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import colors from '../config/colors';

interface IconProps {
  name: string;
  size?: number;
  iconColor?: string;
  style?: any;
}

function appIcon({name, size = 40, iconColor = colors.dark, style}: IconProps) {
  return <Icon name={name} color={iconColor} size={size} style={style} />;
}

export default appIcon;
