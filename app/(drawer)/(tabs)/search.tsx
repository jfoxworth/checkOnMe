import React, { useState, useEffect } from 'react';
import { View, Image, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import Icon, { IconName } from '@/components/Icon';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import List from '@/components/layout/List';
import ListItem from '@/components/layout/ListItem';
import { CardScroller } from '@/components/CardScroller';
import Section from '@/components/layout/Section';
import Card from '@/components/Card';
import AnimatedView from '@/components/AnimatedView';

const MainSearchScreen = () => {
  const colors = useThemeColors();

  const arrivals = [
    {
      id: 1,
      title: 'Premium Cotton T-Shirt',
      description: 'High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
      price: '$29.99',
      rating: 4.8,
      image: require('@/assets/img/male.jpg'),
    },
    {
      id: 2,
      title: 'Classic Denim Jeans',
      description: 'Classic fit denim jeans with premium quality fabric.',
      price: '$59.99',
      rating: 4.6,
      image: require('@/assets/img/female-2.jpg'),
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

  return (
    <>
      <View className='p-global bg-light-primary dark:bg-dark-primary'>
        <Link href="/screens/search-form" asChild>
          <Pressable className='bg-light-primary py-3 px-10 dark:bg-dark-primary border border-black dark:border-white rounded-lg relative'>
            <Icon name="Search" className="absolute top-3 left-3 z-50" size={20} />
            <ThemedText className='text-black dark:text-white'>Search here</ThemedText>
          </Pressable>
        </Link>
      </View>

      <ThemedScroller>

          <Category name="Clothing" image={require('@/assets/img/tops.png')} />
          <Category name="Footwear" image={require('@/assets/img/footwear.png')} />
          <Category name="Bottoms" image={require('@/assets/img/bottoms.png')} />
          <Category name="Accessories" image={require('@/assets/img/accessories.png')} />
          <Section title="New Arrivals" titleSize="lg" className=' my-8'>
            <CardScroller space={10} className='mt-1'>
              {arrivals.map((product) => (
                <Card
                  imageHeight={220}
                  width={150}
                  key={product.id}
                  rounded='lg'
                  title={product.title}
                  image={product.image}
                  price={product.price}
                  href={`/screens/product-detail?id=${product.id}`}
                />
              ))}
            </CardScroller>
          </Section>

      </ThemedScroller>
    </>
  );
};

const Category = (props: any) => (
  <Link href="/screens/products" asChild>
    <TouchableOpacity className='flex-row border border-light-primary dark:border-dark-primary items-center py-4 bg-stone-100 dark:bg-dark-secondary'>
      {/*<Icon name={props.icon} size={24} strokeWidth={1.3} className='mr-2' />*/}
      <Image source={props.image} className='w-20 h-20 bg-transparent mx-4' />
      <ThemedText className='text-lg mr-auto font-bold'>{props.name}</ThemedText>
      <Icon name="ChevronRight" size={24} strokeWidth={1.3} className="opacity-50 ml-auto mr-4" />
    </TouchableOpacity>
  </Link>
)

export default MainSearchScreen;
