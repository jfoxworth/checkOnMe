import React, { useState } from 'react';
import { View, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import Icon from '@/components/Icon';
import ThemeScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Section from '@/components/layout/Section';
import { Placeholder } from '@/components/Placeholder';
import Header from '@/components/Header';

// Mock data for contacts
const initialContacts = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    relationship: 'Sister',
    type: 'both', // email, sms, or both
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@gmail.com',
    phone: '',
    relationship: 'Best Friend',
    type: 'email',
  },
  {
    id: 3,
    name: 'Mom',
    email: '',
    phone: '+1 (555) 987-6543',
    relationship: 'Mother',
    type: 'sms',
  },
];

const ContactsScreen = () => {
  const [contacts, setContacts] = useState(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.relationship.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteContact = (contactId: number) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this contact from your emergency list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setContacts(contacts.filter((contact) => contact.id !== contactId)),
        },
      ]
    );
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'sms':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'both':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <>
      <Header />
      <ThemeScroller>
        <Section
          titleSize="3xl"
          className="mt-16 pb-6"
          title="Check In Contacts"
          subtitle={`These are contacts you can set to be notified if you miss a check-in`}
        />

        {/* Add New Contact Button */}
        <View className="mx-4 mb-6">
          <Button
            title="Add New Contact"
            onPress={() => router.push('/screens/create-contact')}
            className="w-full"
          />
        </View>

        {/* Contacts List */}
        {filteredContacts.length > 0 ? (
          <>
            {filteredContacts.map((contact) => (
              <View
                key={contact.id}
                className="mx-4 mb-4 rounded-lg border border-light-secondary bg-white p-4 dark:border-dark-secondary dark:bg-neutral-900">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="mb-2 flex-row items-center">
                      <Icon
                        name="User"
                        size={16}
                        className="mr-2 text-gray-600 dark:text-gray-400"
                      />
                      <ThemedText className="text-lg font-bold">{contact.name}</ThemedText>
                    </View>

                    <View className="mb-1">
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        {contact.relationship}
                      </ThemedText>
                    </View>

                    {contact.email && (
                      <View className="mb-1 flex-row items-center">
                        <Icon name="Mail" size={14} className="mr-2 text-gray-500" />
                        <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                          {contact.email}
                        </ThemedText>
                      </View>
                    )}

                    {contact.phone && (
                      <View className="mb-2 flex-row items-center">
                        <Icon name="Phone" size={14} className="mr-2 text-gray-500" />
                        <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                          {contact.phone}
                        </ThemedText>
                      </View>
                    )}

                    <View
                      className={`inline-block rounded-full px-2 py-1 ${getContactTypeColor(contact.type)}`}>
                      <ThemedText className="text-xs font-medium">
                        {contact.type === 'both' ? 'Email & SMS' : contact.type.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>

                  <View className="ml-4 flex-row">
                    <Pressable
                      onPress={() => router.push(`/screens/edit-contact?id=${contact.id}`)}
                      className="mr-3 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                      <Icon name="Edit" size={16} className="text-gray-600 dark:text-gray-400" />
                    </Pressable>

                    <Pressable
                      onPress={() => deleteContact(contact.id)}
                      className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                      <Icon name="Trash2" size={16} className="text-red-600 dark:text-red-400" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <Placeholder
            title={searchTerm ? 'No contacts found' : 'No check-in contacts'}
            subtitle={
              searchTerm
                ? 'Try a different search term'
                : 'Add your first check-in contact to get started'
            }
          />
        )}
      </ThemeScroller>
    </>
  );
};

export default ContactsScreen;
