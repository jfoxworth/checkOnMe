import React, { useState } from 'react';
import { View, ScrollView, Image } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import ThemedFooter from '@/components/ThemeFooter';

export default function OnboardingStart() {

    return (
        <>
            <View className="p-6 flex-1 flex mt-auto h-full bg-light-primary dark:bg-dark-primary">
                <View className='flex-1 items-center justify-center'>
                    <Image source={require('@/assets/img/mann.png')} className='w-full h-[450px] object-contain' style={{ resizeMode: 'contain' }} />
                </View>
                <View className='pb-6'>
                    <ThemedText className='text-4xl font-extrabold mt-auto'>Welcome, John</ThemedText>
                    <ThemedText className='text-base text-light-subtext dark:text-dark-subtext mt-2'>We're excited to have you join us! Let's get your account set up with a few quick steps.</ThemedText>
                </View>

            </View>
            <ThemedFooter>
                <Button title="Let's go" href='/screens/onboarding' />
            </ThemedFooter>
        </>
    );
} 