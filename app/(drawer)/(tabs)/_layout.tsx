import { useThemeColors } from 'app/contexts/ThemeColors';
import { TabButton } from 'components/TabButton';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useDrawer } from '@/app/contexts/DrawerContext';
import React from 'react';
import Avatar from '@/components/Avatar';

export default function Layout() {
  const colors = useThemeColors();
  const { openDrawer } = useDrawer();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0} // Adjust if needed
    >
      <Tabs>
        <TabSlot />
        <TabList
          style={{
            backgroundColor: colors.bg,
            borderTopColor: colors.secondary,
            borderTopWidth: 1,
          }}
        >
          <TabTrigger name="home" href="/" asChild>
            <TabButton labelAnimated={true} icon="Home">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="favorites" href="/favorites" asChild>
            <TabButton labelAnimated={true} icon="Heart">Favorites</TabButton>
          </TabTrigger>
          <TabTrigger name="search" href="/(tabs)/search" asChild>
            <TabButton labelAnimated={true} icon="Search">Search</TabButton>
          </TabTrigger>
          <TabTrigger name="cart" href="/cart" asChild>
            <TabButton hasBadge labelAnimated={true} icon="ShoppingCart">
              Cart</TabButton>
          </TabTrigger>
          <TabTrigger name="menu" asChild href="null">
            <TabButton icon="Menu" onPress={openDrawer} >
              Menu
            </TabButton>
          </TabTrigger>
          

          {/****Items that are on this level but hidden from tabBar
          <TabTrigger name="profile" href="/(drawer)/(tabs)/profile" asChild style={{ display: 'none' }}>
            <TabButton icon="user">Profile</TabButton>
          </TabTrigger>*/}
        </TabList>
      </Tabs>
    </KeyboardAvoidingView>
  );
}
