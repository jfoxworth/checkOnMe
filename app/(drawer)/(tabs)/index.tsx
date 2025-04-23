import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React from 'react';
import CustomCard from '@/components/CustomCard';
import { View, Text, Pressable } from 'react-native';
import Icon from '@/components/Icon';
import Section from '@/components/layout/Section';
import { CardScroller } from '@/components/CardScroller';
import Card from '@/components/Card';
import { Button } from '@/components/Button';
import ThemedText from '@/components/ThemedText';
import Grid from '@/components/layout/Grid';
import AnimatedView from '@/components/AnimatedView';
import Avatar from '@/components/Avatar';

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
        image: require('@/assets/img/female-1.jpg'),
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


export default function HomeScreen() {
    const rightComponents = [
        //<HeaderIcon hasBadge icon="MessageCircle" href="/screens/chat/list" />,
        <HeaderIcon hasBadge icon="Bell" href="/screens/notifications" />,
        <Avatar link="/screens/profile" size="xxs" className='mb-2' src={require('@/assets/img/thomino.jpg')} />
    ];

    return (
        <>
            <Header
                leftComponent={<ThemedText className='text-4xl font-outfit-bold'>Velora<Text className='text-teal-300'>.</Text>  </ThemedText>}  
                rightComponents={rightComponents}
                //variant='transparent'
            />

            <ThemeScroller
                scrollEventThrottle={16}
                className='p-0'
            >
                <View>
                    <CustomCard
                        backgroundImage={require('@/assets/img/banner-2.jpg')}
                        className='w-full'
                        rounded='none'
                        overlayOpacity={0}
                        href="/screens/products"
                    >
                        <View className="p-6 w-full h-80 flex flex-col justify-end">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-white text-2xl font-bold">Summer 2025</Text>
                                    <Text className="text-white text-xs mb-3">New collection just arrived</Text>
                                </View>
                            </View>
                            <View className='flex-row items-center justify-start bg-white rounded-full mr-auto py-1 px-4 mt-2'>
                                <Text className="text-sm text-black">
                                    View all
                                </Text>
                            </View>

                        </View>
                    </CustomCard>


                        

                            <CardScroller space={0} className='mt-0'>
                                <Card
                                    title="Night dress"
                                    description="$29.99"
                                    rounded="none"
                                    variant='overlay'
                                    width={280}
                                    imageHeight={400}
                                    image={require('@/assets/img/female-1.jpg')}
                                    href="/screens/product-detail"
                                />
                                <Card
                                    title="Summer jacket"
                                    description="$29.99"
                                    rounded="none"
                                    variant='overlay'
                                    width={280}
                                    imageHeight={400}
                                    image={require('@/assets/img/female-2.jpg')}
                                    href="/screens/product-detail"
                                />
                                <Card
                                    title="Casual jacket"
                                    description="$29.99"
                                    rounded="none"
                                    variant='overlay'
                                    width={280}
                                    imageHeight={400}
                                    image={require('@/assets/img/male-2.jpg')}
                                    href="/screens/product-detail"
                                />
                            </CardScroller>


                        <CardScroller className='mt-3 px-global' space={6}>
                            
                            <Button  href="/screens/products" textClassName='text-neutral-500 dark:text-neutral-500' className='border-neutral-500 dark:border-neutral-500' variant='ghost' rounded='full' size="small" title="Women" />
                            <Button href="/screens/products" textClassName='text-neutral-500 dark:text-neutral-500' className='border-neutral-500 dark:border-neutral-500' variant='ghost' rounded='full' size="small" title="Men" />
                            <Button href="/screens/products" textClassName='text-neutral-500 dark:text-neutral-500' className='border-neutral-500 dark:border-neutral-500' variant='ghost' rounded='full' size="small" title="Kids" />
                            <Button href="/screens/products" textClassName='text-neutral-500 dark:text-neutral-500' className='border-neutral-500 dark:border-neutral-500' variant='ghost' rounded='full' size="small" title="Accessories" />
                            <Button href="/screens/products" textClassName='text-neutral-500 dark:text-neutral-500' className='border-neutral-500 dark:border-neutral-500' variant='ghost' rounded='full' size="small" title="Jewelry" />
                            <Button href="/screens/products" textClassName='text-neutral-500 dark:text-neutral-500' className='border-neutral-500 dark:border-neutral-500' variant='ghost' rounded='full' size="small" title="Sale" />
                        </CardScroller>

                        <Section
                            //title="All Products"
                            className='mt-4 px-global'
                            titleSize='lg'
                        //padding="md"
                        >
                            <Grid className='mt-2' columns={2} spacing={20} >
                                {products.map((product) => (
                                    <Card
                                        imageHeight={250}
                                        key={product.id}
                                        rounded='xl'
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

                </View>
            </ThemeScroller>
        </>
    );
}


const CategorySelect = (props: any) => {
    return (
        <Pressable className='flex-col flex items-center justify-center'>
            <View className='w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center'>
                <Icon name={props.icon} strokeWidth={1.4} size={24} />
            </View>
            <ThemedText className="text-xs">{props.title}</ThemedText>
        </Pressable>
    )
}