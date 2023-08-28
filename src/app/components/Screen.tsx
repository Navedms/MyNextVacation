import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import colors from '../config/colors';

interface ScreenProps {
  children: JSX.Element | JSX.Element[];
  style?: Object;
  onPress?: () => void;
  titleColor?: string;
  backgroundColor?: string;
}

function Screen({
  children,
  style,
  onPress,
  titleColor,
  backgroundColor = colors.white,
}: ScreenProps) {
  return (
    <SafeAreaView style={[styles.screen, {backgroundColor: titleColor}, style]}>
      {onPress ? (
        <TouchableWithoutFeedback onPress={onPress}>
          <View
            style={[styles.view, {backgroundColor: backgroundColor}, style]}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <View style={[styles.view, {backgroundColor: backgroundColor}, style]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: StatusBar.currentHeight,
    flex: 1,
  },
  view: {
    flex: 1,
  },
});

export default Screen;
