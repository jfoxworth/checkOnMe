import React, { ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from '../ThemedText';
import Icon, { IconName } from '../Icon';
import useThemeColors from '@/lib/contexts/ThemeColors';
import AnimatedView from '../AnimatedView';

interface SelectableProps {
  title: string;
  description?: string;
  icon?: IconName;
  customIcon?: ReactNode;
  iconColor?: string;
  selected?: boolean;
  onPress?: () => void;
  error?: string;
  className?: string;
  containerClassName?: string;
}

const Selectable: React.FC<SelectableProps> = ({
  title,
  description,
  icon,
  customIcon,
  iconColor,
  selected = false,
  onPress,
  error,
  className = '',
  containerClassName = '',
}) => {
  const colors = useThemeColors();

  return (
    <View className={`mb-2 ${containerClassName}`}>
      <Pressable
        onPress={onPress}
        className={`
          rounded-lg border p-4 active:opacity-70
          ${selected ? 'border-black dark:border-white' : 'border-black/20 dark:border-white/20'}
          ${error ? 'border-red-500' : ''}
          ${className}
        `}>
        <View className="flex-row items-center">
          {icon && (
            <View className="mr-4">
              <Icon name={icon} size={24} color={iconColor || colors.text} />
            </View>
          )}
          {customIcon && <View className="mr-4">{customIcon}</View>}
          <View className="flex-1">
            <ThemedText className="text-base font-semibold">{title}</ThemedText>
            {description && (
              <ThemedText className="mt-0 text-sm text-light-subtext dark:text-dark-subtext">
                {description}
              </ThemedText>
            )}
          </View>
          {selected ? (
            <AnimatedView className="ml-3" animation="bounceIn" duration={500}>
              <Icon name="CheckCircle2" size={20} color={colors.highlight} />
            </AnimatedView>
          ) : (
            <AnimatedView className="ml-3 opacity-0" animation="bounceIn" duration={500}>
              <Icon name="CheckCircle2" size={20} color={colors.highlight} />
            </AnimatedView>
          )}
        </View>
      </Pressable>

      {error && <ThemedText className="mt-1 text-xs text-red-500">{error}</ThemedText>}
    </View>
  );
};

export default Selectable;
