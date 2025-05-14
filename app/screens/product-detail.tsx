import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Link, router, Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import Select from '@/components/forms/Select';
import { Button } from '@/components/Button';
import ThemedScroller from '@/components/ThemeScroller';

import ImageCarousel from '@/components/ImageCarousel';

import { ActionSheetRef } from 'react-native-actions-sheet';
import ActionSheetThemed from '@/components/ActionSheetThemed';
import { CardScroller } from '@/components/CardScroller';
import Section from '@/components/layout/Section';
import Card from '@/components/Card';
import Expandable from '@/components/Expandable';
import Review from '@/components/Review';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip } from '@/components/Chip';
import Favorite from '@/components/Favorite';

const product = {
    id: 1,
    title: 'Premium Cotton T-Shirt',
    description: 'High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear. High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
    price: '$29.99',
    images: [
        require('@/assets/img/female-1.jpg'),
        require('@/assets/img/female-2.jpg'),
        require('@/assets/img/male-2.jpg'),
        require('@/assets/img/male.jpg')
    ],

};

const ProductDetail = () => {
    const insets = useSafeAreaInsets();
    const [selectedSize, setSelectedSize] = useState<string>();
    const [sizeError, setSizeError] = useState<string>();
    const actionSheetRef = useRef<ActionSheetRef>(null);

    const handleAddToCart = () => {
        if (!selectedSize) {
            setSizeError('Please select a size');
            return;
        }
        setSizeError(undefined);
        actionSheetRef.current?.show();
    };

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
        setSizeError(undefined);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this awesome product: ${product.title}\nPrice: ${product.price}`,
                title: product.title
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const rightComponents = [
        <Favorite productName={product.title} size={25} />,
        <HeaderIcon icon="Share2" onPress={handleShare} href="0" />,
    ];

    return (
        <>
            <Header variant='blurred' title="" rightComponents={rightComponents} showBackButton />
            <ThemedScroller className="px-0 pt-[110px] bg-light-primary dark:bg-dark-primary">
                <ImageCarousel
                    images={product.images}
                    height={590}
                    paginationStyle="dots"
                />

                <View className="p-global">
                    <View className='py-global'>
                        <ThemedText className="text-2xl font-semibold">{product.title}</ThemedText>
                    </View>
                    {/*<FormTabs className='mb-4'>
                        <FormTab title="XS" />
                        <FormTab title="S" />
                        <FormTab title="M" />
                        <FormTab title="L" />
                        <FormTab title="XL" />
                        <FormTab title="XXL" />
                    </FormTabs>*/}
                    <View className='flex-row gap-1'>
                        <Chip
                            label="S"
                            isSelected={selectedSize === 'S'}
                            onPress={() => handleSizeSelect('S')}
                        />
                        <Chip
                            label="M"
                            isSelected={selectedSize === 'M'}
                            onPress={() => handleSizeSelect('M')}
                        />
                        <Chip
                            label="L"
                            isSelected={selectedSize === 'L'}
                            onPress={() => handleSizeSelect('L')}
                        />
                        <Chip
                            label="XL"
                            isSelected={selectedSize === 'XL'}
                            onPress={() => handleSizeSelect('XL')}
                        />
                        <Chip
                            label="XXL"
                            isSelected={selectedSize === 'XXL'}
                            onPress={() => handleSizeSelect('XXL')}
                        />
                    </View>
                    {sizeError && (
                        <ThemedText className="text-red-500 mb-2">{sizeError}</ThemedText>
                    )}

                    <ThemedText className="mb-6 mt-6 text-base">{product.description}</ThemedText>
                    {/*<Button title='Favorite' iconStart='Heart' className="w-full mt-4" size='large' variant='outline' rounded="full" onPress={handleAddToCart} />*/}
                    <Expandable title="Reviews" description='82 reviews' icon="Star" className='mt-10 border-y'>
                        <View className="py-4">
                            <Review
                                className='mb-4 pb-4 border-b border-light-secondary dark:border-dark-secondary'
                                rating={5}
                                description="Absolutely love this t-shirt! The fabric is super soft and comfortable. Fits true to size and washes well."
                                date="May 15, 2023"
                                username="Sarah M."
                                avatar="https://randomuser.me/api/portraits/women/44.jpg"
                            />
                            <Review
                                className='my-4 py-4 border-b border-light-secondary dark:border-dark-secondary'
                                rating={4}
                                description="Great quality shirt, very comfortable. The only reason I'm not giving 5 stars is because it runs slightly large."
                                date="April 3, 2023"
                                username="Michael T."
                                avatar="https://randomuser.me/api/portraits/men/32.jpg"
                            />
                            <Review
                                className='my-4 py-4 border-b border-light-secondary dark:border-dark-secondary'
                                rating={5}
                                description="Perfect fit and the material is high quality. Highly recommend!"
                                date="March 22, 2023"
                                username="Jessica K."
                            />
                            <Button
                                title="Write a review"
                                variant="outline"
                                size="small"
                                className="mt-2"
                                iconStart="Pencil"
                                href="/screens/review"
                            />
                        </View>
                    </Expandable>
                    <Section title="You might also like" titleSize='lg' className='mt-12 mb-4'>
                        <CardScroller className='mt-1'
                            space={5}
                        >
                            <Card
                                title="Running top"
                                rounded='lg'
                                image={require('@/assets/img/female-2.jpg')}
                                imageHeight={220}
                                onPress={() => console.log('Clothing')}
                                width={150}
                                description='$29.99'
                            />
                            <Card
                                title="Running shoes"
                                description='$29.99'
                                rounded='lg'
                                image={require('@/assets/img/female.jpg')}
                                imageHeight={220}
                                onPress={() => console.log('Clothing')}
                                width={150}
                            />
                            <Card
                                title="Running shorts"
                                description='$29.99'
                                rounded='lg'
                                image={require('@/assets/img/male-2.jpg')}
                                imageHeight={220}
                                onPress={() => console.log('Clothing')}
                                width={150}
                            />
                            <Card
                                title="Running socks"
                                description='$29.99'
                                rounded='lg'
                                image={require('@/assets/img/male.jpg')}
                                imageHeight={220}
                                onPress={() => console.log('Clothing')}
                                width={150}
                            />



                        </CardScroller>
                    </Section>
                </View>

            </ThemedScroller>
            <View style={{paddingBottom: insets.bottom}} className='px-6 border-t border-light-secondary dark:border-dark-secondary pt-4 bg-light-primary dark:bg-dark-primary flex-row items-center justify-between'>
                <View>
                    <ThemedText className='text-xs'>Total</ThemedText>
                    <ThemedText className='text-lg font-bold'>$29.99</ThemedText>
                </View>
                <View className='flex-row gap-x-6 items-center'>
                    <Button title='+ Add to cart' className='bg-black dark:bg-white ml-6 px-6' textClassName='text-white dark:text-black' size='medium' onPress={handleAddToCart} />

                </View>
            </View>


            <ActionSheetThemed
                ref={actionSheetRef}
                gestureEnabled
                containerStyle={{
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20
                }}
            >
                <View className="px-4 pt-4">
                    <ThemedText className="text-lg font-bold mb-4">Added to cart</ThemedText>
                    <View className="flex-row items-center mb-6">
                        <Image
                            source={product.images[0]}
                            className="w-20 h-20 rounded-lg bg-light-secondary dark:bg-dark-secondary"
                        />
                        <View className="ml-3">
                            <ThemedText className="font-bold">{product.title}</ThemedText>
                            <ThemedText className="text-light-subtext dark:text-dark-subtext">
                                {product.price}
                            </ThemedText>
                        </View>
                    </View>

                    <View className="flex-row gap-2 w-full">
                        <Button
                            title="Continue shopping"
                            className="flex-1"
                            variant="outline"
                            onPress={() => actionSheetRef.current?.hide()}
                        />
                        <Button
                            className="flex-1"
                            title="Proceed to checkout"
                            onPress={() => {
                                actionSheetRef.current?.hide();
                                router.push('/screens/checkout');
                            }}
                        />
                    </View>
                </View>
            </ActionSheetThemed>
        </>
    );
};

export default ProductDetail;