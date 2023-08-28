import React from 'react';
import {
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from './Icon';

import colors from '../config/colors';
import defaultStyle from '../config/style';
import Button from './Button';

interface AppModal {
  children: JSX.Element | JSX.Element[];
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  closeBtnText?: string;
  closeBtnbackgroundColor?: string;
  style?: Object;
  onCloseModal?: () => void;
  disabled?: boolean;
}

function AppModal({
  children,
  animationType = 'fade',
  transparent = true,
  visible,
  closeBtnText = 'general.close',
  closeBtnbackgroundColor = 'darkMedium',
  setVisible,
  onCloseModal,
  disabled = false,
  style,
}: AppModal) {
  return (
    <Modal
      animationType={animationType}
      transparent={transparent}
      visible={visible}
      onRequestClose={() => {
        onCloseModal && onCloseModal();
        setVisible(!visible);
      }}>
      <View style={styles.fullscreen}>
        <TouchableOpacity
          onPress={() => {
            if (!disabled) {
              onCloseModal && onCloseModal();
              setVisible(!visible);
            }
          }}
          style={styles.closeTitleBtn}>
          <Icon name="close" size={30} iconColor={colors.white} />
        </TouchableOpacity>
        <View style={[styles.container, defaultStyle.rtlAlignItems, style]}>
          <View style={styles.children}>{children}</View>
          {!disabled && (
            <View style={styles.closeBtn}>
              <Button
                title={closeBtnText}
                backgroundColor={closeBtnbackgroundColor}
                onPress={() => {
                  onCloseModal && onCloseModal();
                  setVisible(!visible);
                }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    backgroundColor: colors.opacityBlack,
    flex: 1,
  },
  container: {
    top: '5%',
    left: '5%',
    width: '90%',
    height: '85%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
  },
  closeTitleBtn: {
    width: 30,
    top: Platform.OS === 'android' ? 35 : 40,
    left: 6,
  },
  children: {
    flex: 1,
    zIndex: 1,
  },
  closeBtn: {
    width: '100%',
  },
});

export default AppModal;
