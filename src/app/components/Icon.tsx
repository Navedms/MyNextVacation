import React from 'react';
import {Platform, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import colors from '../config/colors';

interface IconProps {
  name: string;
  size?: number;
  type?: string;
  iconColor?: string;
  style?: any;
}

function appIcon({
  type = 'MaterialCommunityIcons',
  name,
  size = 40,
  iconColor = colors.dark,
  style,
}: IconProps) {
  const ComponentType = (props: any) => {
    if (type === 'MaterialIcons') {
      return <MaterialIcons {...props} />;
    } else {
      return <MaterialCommunityIcons {...props} />;
    }
  };

  return (
    <ComponentType name={name} color={iconColor} size={size} style={style} />
  );
}

export default appIcon;
