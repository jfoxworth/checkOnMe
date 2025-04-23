import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, ViewStyle, Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useThemeColors } from 'app/contexts/ThemeColors';
import { Link } from 'expo-router';
import Icon, { IconName } from './Icon';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponents?: React.ReactNode[];
  backgroundColor?: string;
  textColor?: string;
  leftComponent?: React.ReactNode;
  middleComponent?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  collapsible?: boolean;
  visible?: boolean;
  variant?: 'default' | 'transparent';
};

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponents = [],
  backgroundColor,
  textColor,
  leftComponent,
  middleComponent,
  className,
  style,
  collapsible = false,
  visible = true,
  variant = 'default',
}) => {
  const colors = useThemeColors();
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Determine if we should use the transparent variant styling
  const isTransparent = variant === 'transparent';

  useEffect(() => {
    if (!collapsible) return;
    
    // When visible, use spring for a nice bounce-in from the top
    if (visible) {
      // First move it up slightly off-screen (if it's not already)
      translateY.setValue(-70);
      
      // Then spring it back in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 30,      // Higher tension for faster movement
        friction: 50,     // Lower friction for slight bounce
        velocity: 3,      // Higher initial velocity for more dramatic entrance
      }).start();
    } 
    // When hiding, use spring animation to slide up
    else {
      Animated.spring(translateY, {
        toValue: -70,
        useNativeDriver: true,
        tension: 80,      // High tension for quick movement
        friction: 12,     // Moderate friction for less bounce
        velocity: 2,      // Initial velocity for natural feel
      }).start();
    }
  }, [visible, collapsible, translateY]);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const AnimatedView = Animated.createAnimatedComponent(View);

  // Position absolute for collapsible or transparent variant
  const containerStyle = (collapsible || isTransparent) ? {
    transform: collapsible ? [{ translateY }] : undefined,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  } : {};

  if (isTransparent) {
    return (
      <LinearGradient
        colors={['rgba(0,0,0,0.4)',  'rgba(0,0,0,0)']}
        style={[style, containerStyle]}
        className={`w-full pt-4 pb-14 px-global z-50 ${className}`}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View className="flex-row justify-between">
          <View className='flex-row items-center'>
            {showBackButton && (
              <TouchableOpacity onPress={handleBackPress} className='mr-global relative z-50'>
                <Icon name="ArrowLeft" size={24} color="white" />
              </TouchableOpacity>
            )}

            <View className='flex-row items-center relative z-50'>
              {leftComponent}

              {title && (
                <Text className='text-white text-lg font-bold'>{title}</Text>
              )}
            </View>
          </View>
          
          {middleComponent && (
            <View className='flex-row items-center absolute top-0 left-0 right-0 bottom-0 justify-center'>
              {middleComponent}
            </View>
          )}

          <View className='flex-row items-center relative z-50'>
            {rightComponents.map((component, index) => (
              <View key={index} className="ml-6">
                {component}
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <AnimatedView
      style={[
        style,
        containerStyle
      ]}
      className={`w-full flex-row justify-between py-4 px-global bg-light-primary dark:bg-dark-primary relative z-50 ${className}`}
    >
      <View className='flex-row items-center'>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} className='mr-global relative z-50'>
            <Icon name="ArrowLeft" size={24} color={isTransparent ? 'white' : colors.icon} />
          </TouchableOpacity>
        )}

        <View className='flex-row items-center relative z-50'>
          {leftComponent}

          {title && (
            <Text className='dark:text-white text-lg font-bold'>{title}</Text>
          )}
        </View>
      </View>
      {middleComponent && (
        <View className='flex-row items-center absolute top-0 left-0 right-0 bottom-0 justify-center'>
          {middleComponent}
        </View>
      )}

      <View className='flex-row items-center relative z-50'>
        {rightComponents.map((component, index) => (
          <View key={index} className="ml-6">
            {component}
          </View>
        ))}
      </View>
    </AnimatedView>
  );
};

export default Header;

type HeaderItemProps = {
  href: string;
  icon: IconName;
  className?: string;
  hasBadge?: boolean;
  onPress?: any;
  isWhite?: boolean;
};

export const HeaderIcon = ({ href, icon, hasBadge, onPress, className = '', isWhite = false }: HeaderItemProps) => (
  <>
    {onPress ? (
      <TouchableOpacity onPress={onPress} className='overflow-visible'>
        <View className={`flex-row items-center justify-center relative overflow-visible h-7 w-7 ${className}`}>
          {hasBadge && (
            <View className='w-4 h-4 border-2 border-light-primary dark:border-dark-primary z-30 absolute -top-0 -right-0 bg-red-500 rounded-full' />
          )}
          {isWhite ? (
            <Icon name={icon} size={25} color="white"/>
          ) : (
            <Icon name={icon} size={25}/>
          )}
        </View>
      </TouchableOpacity>
    ) : (
      <Link href={href} asChild>
        <TouchableOpacity className='overflow-visible'>
          <View className={`flex-row items-center justify-center relative overflow-visible h-7 w-7 ${className}`}>
            {hasBadge && (
              <View className='w-4 h-4 border-2 border-light-primary dark:border-dark-primary z-30 absolute -top-0 -right-[3px] bg-red-500 rounded-full' />
            )}
            {isWhite ? (
              <Icon name={icon} size={25} color="white"/>
            ) : (
              <Icon name={icon} size={25}/>
            )}
          </View>
        </TouchableOpacity>
      </Link>
    )}
  </>
);