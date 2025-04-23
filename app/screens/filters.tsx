import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import Slider from '@/components/forms/Slider';
import Counter from '@/components/forms/Counter';
import FormTabs, { FormTab } from '@/components/forms/FormTabs';
import { Button } from '@/components/Button';
import ThemedScroller from '@/components/ThemeScroller';
import ThemeFooter from '@/components/ThemeFooter';
import Header from '@/components/Header';
import Section from '@/components/layout/Section';
import { Chip } from '@/components/Chip';

export default function FiltersScreen() {
    const router = useRouter();
    const [distance, setDistance] = useState(5);
    const [price, setPrice] = useState(50);
    const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
    const [bathrooms, setBathrooms] = useState<number | undefined>(undefined);

    const handleApplyFilters = () => {
        // Handle applying filters here
        router.back();
    };



    return (
        <>
            <Header showBackButton title="Filters" />
            <ThemedScroller className="flex-1 bg-light-primary dark:bg-dark-primary">
                <Section className='mb-7 pb-7 mt-8 border-b border-light-secondary dark:border-dark-secondary' title="Type" subtitle="Select the type of property you're looking for">
                    <FormTabs className='mt-4'>
                        <FormTab title="All" />
                        <FormTab title="Men" />
                        <FormTab title="Women" />
                        <FormTab title="Kids" />
                    </FormTabs>
                </Section>

                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Price" subtitle={`Up to  ${price} USD`}>

                    <Slider
                        //label="Price Limit"
                        value={price}
                        onValueChange={setPrice}
                        minValue={100}
                        maxValue={1000}
                        step={5}
                        initialValue={500}
                        size="l"
                        className='mt-2'
                    />

                </Section>

                
                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Categories" >
                    <View className='flex-row flex-wrap gap-2 mt-2'>
                        <Chip label="Tops" size="lg" selectable />
                        <Chip label="Bottoms" size="lg" selectable />
                        <Chip label="Accessories" size="lg" selectable />
                        <Chip label="Shoes" size="lg" selectable />
                        <Chip label="Jewelry" size="lg" selectable />
                        <Chip label="Home" size="lg" selectable />
                        <Chip label="Beauty" size="lg" selectable />
                        <Chip label="Outdoors" size="lg" selectable />
                    </View>
                </Section>

                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Sizes" >
                    <View className='flex-row flex-wrap gap-2 mt-2'>
                        <Chip label="S" size="lg" selectable />
                        <Chip label="M" size="lg" selectable />
                        <Chip label="L" size="lg" selectable />
                        <Chip label="XL" size="lg" selectable />
                        <Chip label="XXL" size="lg" selectable />
                    </View>
                </Section>

                <Section className='mb-7 pb-7 border-b border-light-secondary dark:border-dark-secondary' title="Brands" >
                    <View className='flex-row flex-wrap gap-2 mt-2'>
                        <Chip label="Adidas" size="lg" selectable />
                        <Chip label="Nike" size="lg" selectable />
                        <Chip label="Puma" size="lg" selectable />
                        <Chip label="Converse" size="lg" selectable />
                        <Chip label="Gucci" size="lg" selectable />
                        <Chip label="Louis Vuitton" size="lg" selectable />
                        <Chip label="Chanel" size="lg" selectable />
                        <Chip label="Dior" size="lg" selectable />
                        <Chip label="Versace" size="lg" selectable />
                        <Chip label="Prada" size="lg" selectable />
                    </View>
                </Section>
            </ThemedScroller>
            <ThemeFooter>
                <Button
                    title="Apply Filters"
                    onPress={handleApplyFilters}
                //className="bg-black"
                />
            </ThemeFooter>
        </>
    );
} 