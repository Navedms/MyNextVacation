import {Platform} from 'react-native';

import colors from './colors';

export default {
  colors,
  text: {
    color: colors.black,
    fontSize: Platform.OS === 'android' ? 18 : 16,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
};
