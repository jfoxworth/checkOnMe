import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from '../ThemedText';
import Icon from '../Icon';
import useThemeColors from '@/lib/contexts/ThemeColors';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  error,
  className = '',
}) => {
  const colors = useThemeColors();

  // Internal state if no onChange provided (for mockups)
  const [internalChecked, setInternalChecked] = React.useState(checked);

  // Use either the controlled prop or internal state
  const isChecked = onChange ? checked : internalChecked;

  const handlePress = () => {
    if (onChange) {
      onChange(!isChecked);
    } else {
      setInternalChecked(!internalChecked);
    }
  };

  return (
    <View className={`mb-global ${className}`}>
      <Pressable onPress={handlePress} className="flex-row items-center">
        <View
          className={`
          flex h-6 w-6 items-center justify-center rounded border
          ${isChecked ? 'bg-primary border-highlight' : 'border-black/40 dark:border-white/40'}
          ${error ? 'border-red-500' : ''}
        `}>
          {isChecked && (
            <View className="h-full w-full items-center justify-center rounded border-[2px] border-light-primary bg-highlight dark:border-dark-primary">
              <Icon name="Check" size={14} color="#fff" />
            </View>
          )}
        </View>
        <ThemedText className="ml-2">{label}</ThemedText>
      </Pressable>

      {error && <ThemedText className="mt-1 text-xs text-red-500">{error}</ThemedText>}
    </View>
  );
};

export default Checkbox;
