import React, { ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from '../ThemedText';
import Icon, { IconName } from '../Icon';
import useThemeColors from '@/app/contexts/ThemeColors';
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
          border rounded-lg p-4 active:opacity-70
          ${selected ? 'border-black dark:border-white' : 'border-black/20 dark:border-white/20'}
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
      >
        <View className="flex-row items-center">
          {icon && (
            <View className="mr-4">
              <Icon 
                name={icon} 
                size={24} 
                color={iconColor || colors.text}
              />
            </View>
          )}
          {customIcon && (
            <View className="mr-4">
              {customIcon}
            </View>
          )}
          <View className="flex-1">
            <ThemedText className="font-semibold text-base">
              {title}
            </ThemedText>
            {description && (
              <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-0">
                {description}
              </ThemedText>
            )}
          </View>
          {selected ? (
            <AnimatedView className="ml-3" animation="bounceIn" duration={500}>
              <Icon 
                name="CheckCircle2" 
                size={20} 
                color={colors.highlight}
              />
            </AnimatedView>
          ) : (
            <AnimatedView className="ml-3 opacity-0" animation="bounceIn" duration={500}>
              <Icon 
                name="CheckCircle2" 
                size={20} 
                color={colors.highlight}
              />
            </AnimatedView>
          )}
        </View>
      </Pressable>

      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">
          {error}
        </ThemedText>
      )}
    </View>
  );
};

export default Selectable; 