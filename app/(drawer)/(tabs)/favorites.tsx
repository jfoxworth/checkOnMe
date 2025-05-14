import React from 'react';
import { View, Pressable, Image } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Card from '@/components/Card';
import { CardScroller } from '@/components/CardScroller';
import Section from '@/components/layout/Section';
import Favorite from '@/components/Favorite';
import { Link } from 'expo-router';
import ThemeScroller from '@/components/ThemeScroller';
import { Placeholder } from '@/components/Placeholder';
import Header from '@/components/Header';
// Mock data for favorites
const favoriteProducts = [
  {
    id: 1,
    title: 'Premium Cotton T-Shirt',
    price: '$29.99',
    image: require('@/assets/img/female-1.jpg'),
  },
  {
    id: 2,
    title: 'Running Shoes',
    price: '$89.99',
    image: require('@/assets/img/female.jpg'),
  },
  {
    id: 3,
    title: 'Casual Jeans',
    price: '$49.99',
    image: require('@/assets/img/male-2.jpg'),
  },
  {
    id: 4,
    title: 'Premium Cotton T-Shirt',
    price: '$29.99',
    image: require('@/assets/img/female-1.jpg'),
  },
  {
    id: 5,
    title: 'Running Shoes',
    price: '$89.99',
    image: require('@/assets/img/female.jpg'),
  },
  {
    id: 6,
    title: 'Casual Jeans',
    price: '$49.99',
    image: require('@/assets/img/male.jpg'),
  },
];

const FavoritesScreen = () => {
  return (
    <>
    <Header />
      <ThemeScroller>

        <Section titleSize='3xl' className='mt-16 pb-10' title="Favorites" subtitle="3 products in your favorites" />

        {favoriteProducts.length > 0 ? (
          <>


            {favoriteProducts.map((product) => (
              <View
                key={product.id}
                className="flex-row items-center py-global pr-global border-b border-light-secondary dark:border-dark-secondary rounded-xl"
              >
                <Link asChild href="/screens/product-detail">
                  <Pressable>
                    <Image
                      source={product.image}
                      className="w-20 h-28 rounded-lg"
                    />
                  </Pressable>
                </Link>
                <View className="flex-1 ml-3">
                  <ThemedText className="font-bold">{product.title}</ThemedText>
                  <ThemedText className="text-light-subtext dark:text-dark-subtext">
                    {product.price}
                  </ThemedText>
                  <Button title="+ Add to cart" variant='outline' size='small' className='mr-auto px-2 py-1 mt-2' />
                </View>
                <View className="flex-row items-center">
                  <Favorite
                    initialState={true}
                    productName={product.title}
                    size={24}
                  />

                </View>
              </View>
            ))}


          </>
        ) : (
          <Placeholder title="No favorites" subtitle="Add some products to your favorites" />
        )}

      </ThemeScroller>
    </>
  );
};

export default FavoritesScreen; 