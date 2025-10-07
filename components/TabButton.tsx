import { useThemeColors } from '@/lib/contexts/ThemeColors';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { ComponentProps, forwardRef, useEffect, useState, ReactNode } from 'react';
import { Text, Pressable, View, Animated } from 'react-native';
import Icon, { IconName } from '@/components/Icon';
import ThemedText from './ThemedText';

export type TabButtonProps = TabTriggerSlotProps & {
  icon?: IconName;
  customContent?: ReactNode;
  labelAnimated?: boolean;
  hasBadge?: boolean;
};

export const TabButton = forwardRef<View, TabButtonProps>(
  (
    {
      icon,
      children,
      isFocused,
      onPress,
      customContent,
      labelAnimated = true,
      hasBadge = false,
      ...props
    },
    ref
  ) => {
    const colors = useThemeColors();

    // Use Animated Values to control opacity and translateY
    const [labelOpacity] = useState(new Animated.Value(isFocused ? 1 : 0));
    const [labelMarginBottom] = useState(new Animated.Value(isFocused ? 0 : 10));
    const [lineScale] = useState(new Animated.Value(isFocused ? 0 : 10));

    // Animate opacity and translation when the tab becomes focused or unfocused
    useEffect(() => {
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(labelMarginBottom, {
          toValue: isFocused ? 0 : 10,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(lineScale, {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [isFocused]);

    // Render icon or custom content
    const renderContent = () => {
      if (customContent) {
        return customContent;
      }

      if (icon) {
        return (
          <View className="relative">
            <View className={`${isFocused ? 'opacity-100' : 'opacity-40'}`}>
              <Icon name={icon} size={24} strokeWidth={isFocused ? 2.5 : 2} color={colors.icon} />
            </View>
            {hasBadge && (
              <View className="absolute -right-1.5 -top-1 h-3 w-3 rounded-full border border-light-primary bg-red-500 dark:border-dark-primary" />
            )}
          </View>
        );
      }

      return null;
    };

    return (
      <Pressable
        className={`w-1/5 overflow-hidden ${isFocused ? '' : ''}`}
        ref={ref}
        {...props}
        onPress={onPress}>
        <View className="relative w-full flex-col items-center justify-center pb-0 pt-4">
          <Animated.View
            className="absolute left-0 top-0 h-[2px] w-full bg-black dark:bg-white"
            style={{
              opacity: lineScale,
              transform: [{ scaleX: lineScale }],
            }}
          />

          {renderContent()}

          {labelAnimated ? (
            <Animated.View
              className="relative"
              style={{
                opacity: labelOpacity,
                transform: [{ translateY: labelMarginBottom }],
              }}>
              <ThemedText className={`mt-px text-[9px]`}>{children}</ThemedText>
            </Animated.View>
          ) : (
            <ThemedText className={`mt-px text-[9px]`}>{children}</ThemedText>
          )}
        </View>
      </Pressable>
    );
  }
);
