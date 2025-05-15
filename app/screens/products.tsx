import React from 'react';
import { Dimensions, ImageBackground, Pressable, View, Text } from 'react-native';
import Header from '@/components/Header';
import Grid from '@/components/layout/Grid';
import Card from '@/components/Card';
import Section from '@/components/layout/Section';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import ThemedScroller from '@/components/ThemeScroller';
import { CardScroller } from '@/components/CardScroller';

import ThemeTabs, { ThemeTab } from '@/components/ThemeTabs';
import FloatingButton from '@/components/FloatingButton';
import ThemeScroller from '@/components/ThemeScroller';
import AnimatedView from '@/components/AnimatedView';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
// Sample product data
const products = [
    {
        id: 1,
        title: 'Premium Cotton T-Shirt',
        description: 'High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
        price: '$29.99',
        rating: 4.8,
        image: require('@/assets/img/male.jpg'),
        badge: 'New',
    },
    {
        id: 2,
        title: 'Classic Denim Jeans',
        description: 'Classic fit denim jeans with premium quality fabric.',
        price: '$59.99',
        rating: 4.6,
        image: require('@/assets/img/female-2.jpg'),
        badge: 'Sale',
    },
    {
        id: 3,
        title: 'Leather Sneakers',
        description: 'Stylish leather sneakers with cushioned sole.',
        price: '$89.99',
        rating: 4.9,
        image: require('@/assets/img/female.jpg'),
    },
    {
        id: 4,
        title: 'Wool Sweater',
        description: 'Warm and cozy wool sweater for cold days.',
        price: '$79.99',
        rating: 4.7,
        image: require('@/assets/img/male-2.jpg'),
    },

];

export default function ProductsScreen() {
    const rightComponents = [
        <Button
            title="Filters"
            size="small"
            variant="outline"
            href="/screens/filters"
            iconEnd="Filter"
        />,
    ];

    return (
        <>
            <Header
                title="Products"
                rightComponents={rightComponents}
                showBackButton
            />

            <ThemeScroller>
            <AnimatedView animation='fadeIn' duration={300} playOnlyOnce={false}>
                <CardScroller className='mt-2' >
                    <Banner
                        title="Summer Collection"
                        description="New arrivals for the season"
                        image={require('@/assets/img/banner.jpg')}
                    />
                    <Banner
                        title="Summer Collection"
                        description="New arrivals for the season"
                        image={require('@/assets/img/banner-2.jpg')}
                    />
                    
                
                </CardScroller>
                <TabContent />
            </AnimatedView>
            </ThemeScroller>
        </>
    );
}

const TabContent = () => {
    return (
        <>



            {/* Products Grid */}
            <Section
                title="All Products"
                className='mt-global'
                titleSize='lg'
            //padding="md"
            >
                <Grid className='mt-2' columns={2} spacing={10} >
                    {products.map((product) => (
                        <Card
                            imageHeight={250}
                            key={product.id}
                            rounded='lg'
                            title={product.title}
                            //description={product.description}
                            image={product.image}
                            price={product.price}
                            //rating={product.rating}
                            badge={product.badge}
                            //badgeColor={product.badgeColor}
                            href={`/screens/product-detail?id=${product.id}`}
                        //variant='overlay'
                        />
                    ))}
                </Grid>
            </Section>
        </>
    );
}

const  Banner  = (props: any) => {
    return (
            <Pressable className='w-[340px] h-[240px] rounded-lg overflow-hidden'>
                <ImageBackground
                    source={props.image}
                    className='w-full h-full'>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)']}
                        className='w-full h-full'
                    >
                        <View className='flex-1 items-start justify-end p-4'>
                            <Text className='text-white text-base font-bold'>{props.title}</Text>
                            <Text className='text-white text-xs'>{props.description}</Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </Pressable>
    )
}