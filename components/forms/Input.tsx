import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput as RNTextInput, Animated, Pressable, TextInputProps } from 'react-native';
import { styled } from 'nativewind';
import Icon, { IconName } from '../Icon';
import ThemedText from '../ThemedText';
import useThemeColors from '@/lib/contexts/ThemeColors';

export type InputVariant = 'animated' | 'classic' | 'underlined';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  error?: string;
  isPassword?: boolean;
  className?: string;
  containerClassName?: string;
  isMultiline?: boolean;
  variant?: InputVariant;
  inRow?: boolean;
}

const StyledTextInput = styled(RNTextInput);

const Input: React.FC<CustomTextInputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  error,
  isPassword = false,
  className = '',
  containerClassName = '',
  value,
  onChangeText,
  isMultiline = false,
  variant = 'animated',
  inRow = false,
  ...props
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Handle label animation
  useEffect(() => {
    if (variant !== 'classic') {
      const hasValue = localValue !== '';
      Animated.timing(animatedLabelValue, {
        toValue: isFocused || hasValue ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, localValue, animatedLabelValue, variant]);

  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText?.(text);
  };

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
    position: 'absolute' as 'absolute',
    zIndex: 50,
    backgroundColor: colors.bg,
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the right icon based on props and password state
  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <Pressable
          onPress={togglePasswordVisibility}
          className={`absolute right-3 ${variant === 'classic' ? 'top-[32px]' : 'top-[18px]'} z-10`}>
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} color={colors.text} />
        </Pressable>
      );
    }

    if (rightIcon) {
      return (
        <Pressable
          onPress={onRightIconPress}
          className={`absolute right-3 ${variant === 'classic' ? 'top-[32px]' : 'top-[18px]'} z-10`}>
          <Icon name={rightIcon} size={20} color={colors.text} />
        </Pressable>
      );
    }

    return null;
  };

  // Classic non-animated input
  if (variant === 'classic') {
    return (
      <View className={`relative mb-global ${containerClassName}`} style={{ position: 'relative' }}>
        {label && <ThemedText className="mb-1 font-medium">{label}</ThemedText>}
        <View className="relative">
          <StyledTextInput
            ref={inputRef}
            className={`rounded-lg border px-3 py-3 ${isMultiline ? 'h-36 pt-4' : 'h-14'} ${isPassword || rightIcon ? 'pr-10' : ''} 
              bg-transparent text-black dark:text-white
              ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
              ${error ? 'border-red-500' : ''}
              ${className}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={localValue}
            onChangeText={handleChangeText}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor={colors.placeholder}
            numberOfLines={isMultiline ? 4 : 1}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            multiline={isMultiline}
            {...props}
          />
          {renderRightIcon()}
        </View>
        {error && <ThemedText className="mt-1 text-xs text-red-500">{error}</ThemedText>}
      </View>
    );
  }

  // Underlined input with only bottom border
  if (variant === 'underlined') {
    return (
      <View className={`relative mb-global ${containerClassName}`} style={{ position: 'relative' }}>
        <View className="relative">
          <Pressable
            className="z-40 bg-light-primary px-0 dark:bg-dark-primary"
            onPress={() => inputRef.current?.focus()}>
            <Animated.Text
              style={[
                {
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
                  left: 0, // No left padding for underlined variant
                  paddingHorizontal: 0, // No horizontal padding
                  position: 'absolute',
                  zIndex: 50,
                  backgroundColor: colors.bg,
                },
              ]}
              className="text-black dark:text-white">
              {label}
            </Animated.Text>
          </Pressable>

          <StyledTextInput
            ref={inputRef}
            className={`border-b-2 px-0 py-3 ${isMultiline ? 'h-36 pt-4' : 'h-14'} ${isPassword || rightIcon ? 'pr-10' : ''} 
              border-l-0 border-r-0 border-t-0 bg-transparent text-black dark:text-white
              ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
              ${error ? 'border-red-500' : ''}
              ${className}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={localValue}
            onChangeText={handleChangeText}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor="transparent"
            numberOfLines={isMultiline ? 4 : 1}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            multiline={isMultiline}
            {...props}
          />

          {renderRightIcon()}
        </View>

        {error && <ThemedText className="mt-1 text-xs text-red-500">{error}</ThemedText>}
      </View>
    );
  }

  // Default animated input (original)
  return (
    <View className={`relative mb-global ${containerClassName}`}>
      <Pressable
        className="z-40 bg-light-primary px-1 dark:bg-dark-primary"
        style={{ position: 'absolute', left: 4, top: 0 }}
        onPress={() => inputRef.current?.focus()}>
        <Animated.Text
          style={[labelStyle]}
          className="bg-light-primary text-black dark:bg-dark-primary dark:text-white">
          {label}
        </Animated.Text>
      </Pressable>

      <StyledTextInput
        ref={inputRef}
        className={`rounded-lg border px-3 py-3 ${isMultiline ? 'h-36 pt-4' : 'h-14'} ${isPassword || rightIcon ? 'pr-10' : ''} 
            bg-transparent text-black dark:text-white
            ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
            ${error ? 'border-red-500' : ''}
            ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={localValue}
        onChangeText={handleChangeText}
        secureTextEntry={isPassword && !showPassword}
        placeholderTextColor="transparent"
        numberOfLines={isMultiline ? 4 : 1}
        textAlignVertical={isMultiline ? 'top' : 'center'}
        multiline={isMultiline}
        {...props}
      />

      {renderRightIcon()}

      {error && <ThemedText className="mt-1 text-xs text-red-500">{error}</ThemedText>}
    </View>
  );
};

export default Input;
