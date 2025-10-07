import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React from 'react';
import CustomCard from '@/components/CustomCard';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import Icon from '@/components/Icon';
import Section from '@/components/layout/Section';
import { CardScroller } from '@/components/CardScroller';
import Card from '@/components/Card';
import { Button } from '@/components/Button';
import ThemedText from '@/components/ThemedText';
import Grid from '@/components/layout/Grid';
import AnimatedView from '@/components/AnimatedView';
import Avatar from '@/components/Avatar';
import { Chip } from '@/components/Chip';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// Removed unused product data for check-in focused app

export default function HomeScreen() {
  const rightComponents = [
    //<HeaderIcon hasBadge icon="MessageCircle" href="/screens/chat/list" />,
    <HeaderIcon hasBadge icon="Bell" href="/screens/notifications" />,
    <Avatar
      link="/screens/profile"
      size="xxs"
      className="mb-1 ml-1"
      src={require('@/assets/img/thomino.jpg')}
    />,
  ];

  return (
    <>
      <Header
        variant="blurred"
        leftComponent={
          <ThemedText className="font-outfit-bold text-2xl">
            Check on me<Text className="text-teal-300">.</Text>
          </ThemedText>
        }
        rightComponents={rightComponents}
        //variant='transparent'
      />

      <ThemeScroller scrollEventThrottle={16} className="p-0" style={{ paddingTop: 100 }}>
        <View className="flex-1">
          <CustomCard
            backgroundImage={require('@/assets/img/introBackground1.jpg')}
            className="w-full"
            rounded="none"
            overlayOpacity={0.2}>
            <View className="mt-8 flex h-[350px] w-full flex-col p-6">
              <View className="w-3/4 flex-row items-center justify-between">
                <View>
                  <Text className="mb-5 text-2xl font-bold text-white">Check On Me</Text>
                  <Text className="text-xl text-white">
                    We discretely check on you and notify the people you want contacted if you miss
                    the check in.
                  </Text>
                </View>
              </View>
            </View>
          </CustomCard>

          <Section
            titleSize="3xl"
            className="mt-8 bg-gray-50 pb-10 pl-5 dark:bg-neutral-900"
            title="Use cases"
            subtitle="Hiking trips, first dates, road trips, and more"
          />

          <CustomCard
            backgroundImage={require('@/assets/img/hikingBackground1.jpg')}
            className="w-full"
            rounded="none"
            overlayOpacity={0.5}>
            <View className="mb-5 mt-3 flex h-[350px] w-full flex-col p-6">
              <View className="w-3/4 flex-row items-center justify-between">
                <View>
                  <Text className="mb-5 text-2xl font-bold text-white">Hiking Trips</Text>
                  <Text className="text-xl text-white">
                    Tell us where you're going, who you're going with, and who you want contacted
                    with that info. Schedule a check in for when you expect to be back. If you don't
                    respond to the check in, we send out the notification with your info.
                  </Text>
                </View>
              </View>
            </View>
          </CustomCard>

          <Section
            titleSize="3xl"
            className="mt-8 bg-gray-50 pb-10 pl-5 dark:bg-neutral-900"
            title="How it works">
            <Text className="my-3 mr-3 text-lg">
              You create and schedule a check in. You set notifications to go out to emails or phone
              numbers. At the time you schedule, the app will prompt you to enter the 4 digit code
              you set up. If you don't respond, the app will send out an email or text with the info
              you filled out. If you respond, nothing happens."
            </Text>
          </Section>

          <CustomCard
            backgroundImage={require('@/assets/img/datingBackground1.jpg')}
            className="w-full"
            rounded="none"
            overlayOpacity={0.5}>
            <View className="mb-5 mt-3 flex h-[350px] w-full flex-col p-6">
              <View className="w-full flex-row items-center justify-between">
                <View>
                  <Text className="mb-5 text-2xl font-bold text-white">First Dates</Text>
                  <Text className="text-xl text-white">
                    Record who you're meeting, where, and when. Schedule a check in for after your
                    date. If you don't respond to the check in, we send out the notification with
                    your info.
                  </Text>
                </View>
              </View>
            </View>
          </CustomCard>

          <Section
            titleSize="3xl"
            className="mt-8 bg-gray-50 pb-10 pl-5 dark:bg-neutral-900"
            title="Both Secure and Private">
            <Text className="my-3 mr-3 text-lg">
              If you check in, no notifications are sent out. There is no need for your family and
              friends to know your plans and no need to rely on someone to check on you.
            </Text>
          </Section>

          <CustomCard
            backgroundImage={require('@/assets/img/roadTripBackground1.jpg')}
            className="w-full"
            rounded="none"
            overlayOpacity={0.5}>
            <View className="mb-5 mt-3 flex h-[350px] w-full flex-col p-6">
              <View className="w-full flex-row items-center justify-end">
                <View className="w-3/4 items-end">
                  <Text className="mb-5 text-2xl font-bold text-white">Road Trips</Text>
                  <Text className="text-xl text-white">
                    Record where you're going, who you're going with, and your route. If something
                    happens, we'll alert the people you want contacted with your info.
                  </Text>
                </View>
              </View>
            </View>
          </CustomCard>

          <Section titleSize="2xl" className="0 mt-8 pb-10 pl-5 pr-5" title="Ready to get started?">
            <Text className="my-3 mr-3 text-lg text-gray-700 dark:text-gray-300">
              Set up your first check-in and stay safe on your next adventure.
            </Text>
            <Button
              title="Create Check-In"
              className="mt-4 px-8 py-3"
              onPress={() => router.push('/screens/create-checkin')}
            />
          </Section>
        </View>
      </ThemeScroller>
    </>
  );
}

const CategorySelect = (props: any) => {
  return (
    <Pressable className="flex flex-col items-center justify-center">
      <View className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <Icon name={props.icon} strokeWidth={1.4} size={24} />
      </View>
      <ThemedText className="text-xs">{props.title}</ThemedText>
    </Pressable>
  );
};

// Removed unused product components for check-in focused app
