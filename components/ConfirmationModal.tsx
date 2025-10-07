import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import useThemeColors from '@/lib/contexts/ThemeColors';
import ThemedText from '@/components/ThemedText';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface ConfirmationModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  actionSheetRef: React.RefObject<ActionSheetRef>;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  actionSheetRef,
}) => {
  const colors = useThemeColors();
  const { isDark } = useTheme();

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(colors.bg);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

      return () => {
        // Reset to default theme color when modal closes
        NavigationBar.setBackgroundColorAsync(colors.bg);
        NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
      };
    }
  }, [isDark, colors.bg]);

  const handleConfirm = () => {
    actionSheetRef.current?.hide();
    onConfirm();
  };

  const handleCancel = () => {
    actionSheetRef.current?.hide();
    onCancel();
  };

  return (
    <ActionSheet
      ref={actionSheetRef}
      gestureEnabled={true}
      drawUnderStatusBar={false}
      statusBarTranslucent={true}
      containerStyle={{
        backgroundColor: colors.bg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}>
      <View className="p-8 pb-14">
        <ThemedText className="mb-2 text-xl font-bold">{title}</ThemedText>
        <ThemedText className="mb-6 text-light-subtext dark:text-dark-subtext">
          {message}
        </ThemedText>

        <View className="flex-row justify-between space-x-3">
          <Pressable
            onPress={handleCancel}
            className="flex-1 items-center rounded-lg bg-light-secondary px-4 py-3 dark:bg-dark-secondary">
            <ThemedText>{cancelText}</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            className="flex-1 items-center rounded-lg bg-red-500 px-4 py-3">
            <Text className="text-white">{confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </ActionSheet>
  );
};

export default ConfirmationModal;
