import { useThemeColors } from '@/lib/contexts/ThemeColors';
import { TabButton } from 'components/TabButton';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useDrawer } from '@/lib/contexts/DrawerContext';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DrawerButton from '@/components/DrawerButton';
import { BlurView } from 'expo-blur';
export default function Layout() {
  const colors = useThemeColors();
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <TabSlot />
      <TabList
        style={{
          backgroundColor: colors.bg,
          borderTopColor: colors.secondary,
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
        }}>
        <TabTrigger name="home" href="/" asChild>
          <TabButton labelAnimated={true} icon="Home">
            Home
          </TabButton>
        </TabTrigger>
        <TabTrigger name="checkins" href="/checkins" asChild>
          <TabButton labelAnimated={true} icon="Clock">
            Check Ins
          </TabButton>
        </TabTrigger>
        <TabTrigger name="contacts" href="/contacts" asChild>
          <TabButton labelAnimated={true} icon="Users">
            Contacts
          </TabButton>
        </TabTrigger>
        <TabTrigger name="plans" href="/plans" asChild>
          <TabButton labelAnimated={true} icon="CreditCard">
            Plans
          </TabButton>
        </TabTrigger>

        <View className="flex w-1/5 items-center justify-center opacity-40   ">
          <DrawerButton className="w-full" />
        </View>

        {/****Items that are on this level but hidden from tabBar
          <TabTrigger name="profile" href="/(drawer)/(tabs)/profile" asChild style={{ display: 'none' }}>
            <TabButton icon="user">Profile</TabButton>
          </TabTrigger>*/}
      </TabList>
    </Tabs>
  );
}
