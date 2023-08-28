import React from 'react';
import Lottie from 'lottie-react-native';

function Activityindicator({visible = false}) {
  if (!visible) return null;
  return (
    <Lottie
      autoPlay
      loop
      source={require('../assets/animations/loader')}
      style={{zIndex: 10}}
    />
  );
}

export default Activityindicator;
