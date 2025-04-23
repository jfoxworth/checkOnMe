import { View, Image, ScrollView } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import Avatar from '@/components/Avatar';
import ListLink from '@/components/ListLink';
import AnimatedView from '@/components/AnimatedView';
import ThemedScroller from '@/components/ThemeScroller';

export default function ProfileScreen() {
    return (
        <AnimatedView className='flex-1 bg-light-primary dark:bg-dark-primary' animation='fadeIn' duration={350} playOnlyOnce={false}   >
            <Header showBackButton />
            <ThemedScroller>
                <View className=" pt-10 pb-10 w-full">
                    <View className="flex-row items-center mb-4">

                        <View className="ml-4 flex-1">
                            <ThemedText className="text-2xl font-bold">John Doe</ThemedText>
                            <View className='flex flex-row items-center'>
                                <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext'>johndoe@gmail.com</ThemedText>
                            </View>
                        </View>
                        <Avatar src="https://mighty.tools/mockmind-api/content/human/5.jpg" size="lg" />
                    </View>
                </View>

                <View className='px-4'>
                    <ListLink title="Settings" description="Name, email, password" icon="Settings" href="/screens/settings" />
                    <ListLink title="Address Book" description="Add, edit, delete addresses" icon="MapPin" href="/screens/profile/address-book" />
                    <ListLink title="Payments" description="Manage payment methods" icon="CreditCard" href="/screens/profile/payments" />
                    <ListLink title="Notifications" description="Push notifications, email notifications" icon="Bell" href="/screens/profile/notifications" />
                    <ListLink title="Currency" description="USD - United states dollar" icon="DollarSign" href="/screens/profile/currency" />
                    <ListLink title="Help" description="Contact support" icon="HelpCircle" href="/screens/help" />
                    <ListLink title="Logout" description="Logout from your account"  icon="LogOut" href="/screens/logout" />
                </View>
            </ThemedScroller>

        </AnimatedView>
    );
}