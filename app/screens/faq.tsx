import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import Header from '@/components/Header';
import Icon from '@/components/Icon';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Placeholder FAQ data - you can fill these in manually
const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I create my first check-in?',
    answer:
      'To create your first check-in, tap the "+" button on the Check-ins screen, fill in your activity details, select your emergency contacts, and set your check-in time. The app will automatically monitor your safety during the activity.',
  },
  {
    id: '2',
    category: 'Getting Started',
    question: "What happens if I don't respond to a check-in?",
    answer:
      "If you don't respond within the specified time window, the app will automatically notify your emergency contacts via email, SMS, or both (depending on your settings). This ensures someone knows you may need help.",
  },
  {
    id: '3',
    category: 'Safety Features',
    question: 'How do emergency contacts work?',
    answer:
      "Emergency contacts are people who will be notified if you don't check in on time. You can add permanent contacts to your profile or create temporary contacts for specific activities.",
  },
  {
    id: '4',
    category: 'Safety Features',
    question: 'Can I add companions to my check-ins?',
    answer:
      "Yes! You can add information about people you're with during your activity. This helps emergency responders know who else might be involved if something goes wrong.",
  },
  {
    id: '5',
    category: 'Pricing & Credits',
    question: 'How do credits work?',
    answer:
      'Each check-in uses one credit. You can purchase credit packs in the Payment & Billing section. Credits never expire and can be used for any type of safety check-in.',
  },
  {
    id: '6',
    category: 'Pricing & Credits',
    question: 'Do I need a subscription?',
    answer:
      'No subscription required! CheckOnMe works on a simple pay-per-use model. Buy credits when you need them, no monthly fees.',
  },
  {
    id: '7',
    category: 'Privacy & Security',
    question: 'Is my location data stored?',
    answer:
      'Location data is only stored temporarily during active check-ins and is automatically deleted after the activity is completed. We take your privacy seriously.',
  },
  {
    id: '8',
    category: 'Privacy & Security',
    question: 'Who can see my check-in information?',
    answer:
      'Only you and your selected emergency contacts can see check-in details. We never share your personal information with third parties.',
  },
];

const categories = Array.from(new Set(faqData.map((item) => item.category)));

const FAQScreen = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs =
    selectedCategory === 'all'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  return (
    <>
      <Header />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-2xl font-bold">Frequently Asked Questions</ThemedText>
            <ThemedText className="text-gray-600 dark:text-gray-400">
              Find answers to common questions about CheckOnMe
            </ThemedText>
          </View>

          {/* Category Filter */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-semibold">Categories</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              <TouchableOpacity
                onPress={() => setSelectedCategory('all')}
                className={`mr-2 rounded-full px-4 py-2 ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                <ThemedText
                  className={`${
                    selectedCategory === 'all' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                  All
                </ThemedText>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`mr-2 rounded-full px-4 py-2 ${
                    selectedCategory === category
                      ? 'bg-blue-500 dark:bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                  <ThemedText
                    className={`${
                      selectedCategory === category
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* FAQ Items */}
          <View className="space-y-3">
            {filteredFAQs.map((item) => (
              <View
                key={item.id}
                className="rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800">
                <TouchableOpacity
                  onPress={() => toggleExpand(item.id)}
                  className="flex-row items-center justify-between p-4">
                  <View className="flex-1 pr-2">
                    <ThemedText className="text-base font-semibold">{item.question}</ThemedText>
                    <ThemedText className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {item.category}
                    </ThemedText>
                  </View>
                  <Icon
                    name={expandedItems.has(item.id) ? 'ChevronUp' : 'ChevronDown'}
                    size={20}
                    className="text-gray-400"
                  />
                </TouchableOpacity>

                {expandedItems.has(item.id) && (
                  <View className="border-t border-gray-200 p-4 dark:border-gray-600">
                    <ThemedText className="text-gray-700 dark:text-gray-300">
                      {item.answer}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Support */}
          <View className="mb-8 mt-8 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/20">
            <View className="mb-2 flex-row items-center">
              <Icon name="HelpCircle" size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
              <ThemedText className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                Still need help?
              </ThemedText>
            </View>
            <ThemedText className="mb-3 text-blue-700 dark:text-blue-400">
              Can't find what you're looking for? Our support team is here to help.
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/screens/support')}
              className="rounded-lg bg-blue-600 px-4 py-2 dark:bg-blue-500">
              <ThemedText className="text-center font-semibold text-white">
                Contact Support
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default FAQScreen;
