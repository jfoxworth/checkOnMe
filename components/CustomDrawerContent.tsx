import { Link, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import ThemedText from './ThemedText';
import Icon, { IconName } from './Icon';
import Avatar from './Avatar';
import Expandable from './Expandable';
import ThemeToggle from '@/components/ThemeToggle';
import ThemedScroller from './ThemeScroller';


export default function CustomDrawerContent() {
    return (
        <ThemedScroller className="flex-1 p-8 bg-white dark:bg-dark-primary">

            <View className='flex-col '>
                <View className='flex-row items-center justify-between w-full'>
                    <Avatar link="/(drawer)/(tabs)/profile" size="md" className='mb-2' border src="https://mighty.tools/mockmind-api/content/human/5.jpg" />
                    <ThemeToggle />
                </View>
                <View className='ml-0'>
                    <ThemedText className='text-lg font-bold'>John Dogerthy</ThemedText>
                    <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext mb-4'>johndoe0294</ThemedText>
                </View>

            </View>

            <View className='flex-col py-6 my-6 border-y border-light-secondary dark:border-dark-secondary'>
                <NavItem href="/screens/profile" icon="User" label="Profile" />
                <NavItem href="/screens/orders" icon="Package" label="Orders" />
                <NavItem href="/screens/admin" icon="Contact" label="Admin" />
                <NavItem href="/screens/onboarding-start" icon="Lightbulb" label="Onboarding" />
                <NavItem href="/screens/welcome" icon="Package" label="Welcome" />
                <NavItem href="/screens/notification-permission" icon="ShieldCheck" label="Permissions" />
                <NavItem href="/screens/chat/list" icon="MessageCircle" label="Chat" />
                <NavItem href="/screens/login" icon="ArrowLeft" label="Sign out" />

            </View>
            <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext'>Version 0.0.12</ThemedText>

        </ThemedScroller>
    );
}

type NavItemProps = {
    href: string;
    icon: IconName;
    label: string;
    className?: string;
};

export const NavItem = ({ href, icon, label }: NavItemProps) => (

    <TouchableOpacity onPress={() => router.push(href)} className={`flex-row items-center py-4`}>
        <Icon name={icon} size={24} className='' />
        {label &&
            <ThemedText className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200">{label}</ThemedText>
        }
    </TouchableOpacity>

);


