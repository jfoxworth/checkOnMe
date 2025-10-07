import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput as RNTextInput, Animated, Pressable, TextInputProps } from 'react-native';
import { styled } from 'nativewind';
import Icon from '../Icon';

import ThemedText from '../ThemedText';
import useThemeColors from '@/lib/contexts/ThemeColors';

interface CustomTextInputProps extends TextInputProps {
  label: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
  isPassword?: boolean;
  className?: string;
  containerClassName?: string;
}

const StyledTextInput = styled(RNTextInput);

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  error,
  isPassword = false,
  className = '',
  containerClassName = '',
  value,
  onChangeText,
  ...props
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<RNTextInput>(null);

  // Handle label animation
  useEffect(() => {
    Animated.timing(animatedLabelValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedLabelValue]);

  const labelStyle = {
    top: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.placeholder, colors.text],
    }),
    left: 12, // Consistent left padding
    paddingHorizontal: 8, // Consistent padding on both sides
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the right icon based on props and password state
  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <Pressable onPress={togglePasswordVisibility} className="absolute right-3 top-[18px] z-10">
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.text} />
        </Pressable>
      );
    }

    if (rightIcon) {
      return (
        <Pressable onPress={onRightIconPress} className="absolute right-3 top-[18px] z-10">
          <Icon name={rightIcon} size={20} color={colors.text} />
        </Pressable>
      );
    }

    return null;
  };

  return (
    <View className={`mb-global ${containerClassName}`}>
      <View className="relative">
        <Pressable
          className="z-40 bg-light-primary px-1 dark:bg-dark-primary"
          onPress={() => inputRef.current?.focus()}>
          <Animated.Text
            style={[labelStyle]}
            className="absolute z-50 bg-light-primary px-1 text-black dark:bg-dark-primary dark:text-white">
            {label}
          </Animated.Text>
        </Pressable>

        <StyledTextInput
          ref={inputRef}
          className={`h-14 rounded-lg border px-3 py-3 ${isPassword || rightIcon ? 'pr-10' : ''} 
            bg-transparent text-black dark:text-white
            ${isFocused ? 'border-black dark:border-white' : 'border-black/40 dark:border-white/40'}
            ${error ? 'border-red-500' : ''}
            ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="transparent"
          {...props}
        />

        {renderRightIcon()}
      </View>

      {error && <ThemedText className="mt-1 text-xs text-red-500">{error}</ThemedText>}
    </View>
  );
};

export default TextInput;
