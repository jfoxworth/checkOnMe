import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useThemeColors } from '../contexts/ThemeColors';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { DrawerProvider } from '../contexts/DrawerContext';

// Create a ref to the drawer instance that can be used across the app
export const drawerRef = React.createRef();

export default function DrawerLayout() {
    const colors = useThemeColors();
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <DrawerProvider>
            <Drawer
                ref={drawerRef}
                screenOptions={{
                    headerShown: false,
                    drawerType: 'front',
                    drawerPosition: 'right',
                    drawerStyle: {
                        //backgroundColor: colors.bg,
                        backgroundColor: 'transparent',
                        width: '78%',
                        flex: 1,
                        elevation: 11,
                        shadowColor: 'black',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.4,
                        shadowRadius: 20,
                    },
                    overlayColor: 'rgba(0,0,0, 0.2)',
                    swipeEdgeWidth: 100
                }}
                drawerContent={(props) => <CustomDrawerContent />}
            />
        </DrawerProvider>
    );
}