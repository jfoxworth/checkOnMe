import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Pressable, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import Icon, { IconName } from '@/components/Icon';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import List from '@/components/layout/List';
import ListItem from '@/components/layout/ListItem';
const SearchScreen = () => {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(true); // Start focused
  const inputRef = useRef<TextInput>(null);

  const products = [
      { id: 1, name: 'Blue t-shirt', price: '$29.99', image: require('@/assets/img/female-1.jpg') },
      { id: 2, name: 'Orange t-shirt', price: '$19.99', image: require('@/assets/img/female.jpg') },
      { id: 3, name: 'Red t-shirt', price: '$29.99', image: require('@/assets/img/male-2.jpg') },
      { id: 4, name: 'Blue t-shirt', price: '$29.99', image: require('@/assets/img/female-1.jpg') },
      { id: 5, name: 'Orange t-shirt', price: '$19.99', image: require('@/assets/img/female.jpg') },
      { id: 6, name: 'Red t-shirt', price: '$29.99', image: require('@/assets/img/male-2.jpg') },
  ];

  // Auto-focus input when component mounts
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Small delay to ensure UI is ready
  }, []);

  // Filter function to apply search query to the data
  const filterData = (data: any[]) => {
    if (!searchQuery) return data; // Return all items if no search query
    return data.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <>
      <View className='p-global bg-light-primary dark:bg-dark-primary'>
        <View className='bg-light-primary dark:bg-dark-primary border border-black dark:border-white rounded-lg relative'>
          <Icon name="ArrowLeft" onPress={() => router.back()} className="absolute top-1.5 left-1.5 z-50" size={20} />

          <TextInput
            ref={inputRef}
            className='py-3 pl-10 pr-3 rounded-lg text-black dark:text-white'
            placeholder='Search here'
            placeholderTextColor={colors.placeholder}
            onChangeText={setSearchQuery}
            value={searchQuery}
            returnKeyType="done"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(searchQuery.length > 0)} // Only unfocus if there's no query
            autoFocus={true}
          />

          {/* Render the 'x' icon only when the search query is not empty */}
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery('');
                // Keep focused state if input is still focused
                setIsInputFocused(true);
                inputRef.current?.focus();
              }}
              className="absolute top-3 right-3 z-50 opacity-50"
            >
              <Icon name='X' size={20} />
            </Pressable>
          )}
        </View>
      </View>

      <ThemedScroller className='flex-1' keyboardShouldPersistTaps='handled'>
       

          <SearchSection 
            title={searchQuery ? "Search Results" : "All Products"} 
            data={filterData(products)} 
            renderItem={Product} 
          />


      </ThemedScroller>
    </>
  );
};

interface SearchSectionProps {
  title: string;
  data: any[];
  renderItem: (item: any) => JSX.Element;
}

const SearchSection = ({ title, data, renderItem }: SearchSectionProps) => (
  <>
    {data.length > 0 ? (
      <View className='mb-8'>
        <ThemedText className='text-lg font-bold mb-4'>{data.length} {title}</ThemedText>
        <List spacing={25} variant="separated">
          {data.map((item) => (
            <View key={item.id}>
              {renderItem(item)}
            </View>
          ))}
        </List>
      </View>
    ) : (
      <View className='flex-1 items-center justify-center p-10'>
        <ThemedText className='text-lg font-bold mb-2 text-center'>
          No products found
        </ThemedText>
        <ThemedText className='text-center text-light-subtext dark:text-dark-subtext'>
          Try adjusting your search terms.
        </ThemedText>
      </View>
    )}
  </>
);


interface ProductProps {
  id: number;
  image: any;
  name: string;
  price: string;
}

const Product = ({ id, image, name, price }: ProductProps) => (
  <Link href={`/screens/product-detail?id=${id}`} asChild>
    <ListItem
      leading={
        <Image
          source={image}
          className='w-12 h-16 rounded-md bg-light-secondary dark:bg-dark-secondary'
        />
      }
      title={name}
      subtitle={price}
      trailing={<Icon name="ChevronRight" size={15} className="opacity-50" />}
      onPress={() => { }}
    />
  </Link>
);
export default SearchScreen;
