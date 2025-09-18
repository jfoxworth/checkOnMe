import { View, Text, FlatList, Dimensions, Image, Pressable } from 'react-native';
import { useState, useRef } from 'react';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import ThemeToggle from '@/components/ThemeToggle';
import { AntDesign } from '@expo/vector-icons';
import useThemeColors from '../contexts/ThemeColors';
import { router } from 'expo-router';
import React from 'react';
import Icon from '@/components/Icon';
const { width } = Dimensions.get('window');
const windowWidth = Dimensions.get('window').width;
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const slides = [
    {
        id: '1',
        title: 'Velora. shopping template',
        image: require('@/assets/img/onboarding-1.png'),
        description: 'Complete shopping experience',
    },
    {
        id: '2',
        title: 'Elegant design',
        image: require('@/assets/img/onboarding-2.png'),
        description: 'Elegant design for your shopping app',
    },
    {
        id: '3',
        title: 'Customizable & Fast',
        image: require('@/assets/img/onboarding-3.png'),
        description: 'Easily modify themes, layouts, and state management for your app.',
    },
];

export default function OnboardingScreen() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleScroll = (event: { nativeEvent: { contentOffset: { x: number; }; }; }) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    return (
        <>
        <View style={{paddingTop: insets.top, paddingBottom: insets.bottom}} className="flex-1 relative bg-light-primary dark:bg-dark-primary">
            <View className='p-global justify-end items-end'>
                <ThemeToggle />
            </View>
            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={windowWidth} // 👈 Ensures snapping works perfectly
                renderItem={({ item }) => (
                    <View style={{ width: windowWidth }} className="items-center justify-center p-6">
                        <Image source={item.image} style={{width: windowWidth, height: windowWidth}} />
                        <ThemedText className="text-2xl mt-4 font-outfit-bold">{item.title}</ThemedText>
                        <Text className="text-center w-2/3 text-light-subtext dark:text-dark-subtext mt-2">{item.description}</Text>
                    </View>
                )}
                ListFooterComponent={() => (
                    <View className='w-full h-28' />
                )}
                keyExtractor={(item) => item.id}
            />

            <View className="flex-row justify-center mb-20  w-full">
                {slides.map((_, index) => (
                    <View
                        key={index}
                        className={`h-[2px] mx-px ${index === currentIndex ? 'bg-black dark:bg-white w-4' : 'bg-light-secondary dark:bg-dark-secondary w-4'}`}
                    />
                ))}
            </View>


            {/* Login/Signup Buttons */}
            <View className="w-full px-6 mb-global flex flex-col space-y-2">
                <Pressable onPress={() => router.push('/screens/signup')} className='w-full border border-black dark:border-white rounded-full flex flex-row items-center justify-center py-4'>
                    <Icon name="Mail" size={20}  />
                    <Text className='text-black dark:text-white ml-3'>Use email</Text>
                </Pressable>
                <View className='flex flex-row items-center justify-center gap-2'>
                    <Pressable onPress={() => router.push('/(drawer)/(tabs)')} className='flex-1 bg-black dark:bg-white rounded-full flex flex-row items-center justify-center py-4'>
                        <AntDesign name="google" size={22} color={colors.invert} />
                        <Text className='ml-3 text-white dark:text-black'>Google login</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push('/(drawer)/(tabs)')} className='flex-1 relative bg-black dark:bg-white rounded-full flex flex-row items-center justify-center py-4'>

                        <AntDesign name="apple" size={22} color={colors.invert} />
                        <Text className='ml-3 text-white dark:text-black'>Apple ID</Text>
                    </Pressable>
                </View>
            </View>
        </View>
        </>
    );
}
