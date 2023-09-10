import React from 'react';
import {Text} from 'react-native';

import defaultStyle from '../config/style';

interface IText {
  children: string;
  style?: Object;
  numberOfLines?: number;
}

function AppText({children, style, ...otherProps}: IText) {
  return (
    <Text style={[defaultStyle.text, style]} {...otherProps}>
      {children}
    </Text>
  );
}

export default AppText;
