import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Image, TextInput, ScrollView, BackHandler, Alert, ImageSourcePropType, Modal, TouchableOpacity, AppState, ImageBackground } from 'react-native';
import { Stack, router, Link, useRouter, useNavigation } from 'expo-router';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import ThemedScroller from '@/components/ThemeScroller';
import { Button } from '@/components/Button';
import Input from '@/components/forms/Input';
import Icon from '@/components/Icon';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MultiStep, { Step } from '@/components/MultiStep';
import Section from '@/components/layout/Section';
import Selectable from '@/components/forms/Selectable';
import useThemeColors from '../contexts/ThemeColors';
import Toggle from '@/components/Toggle';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import BackHandlerManager from '@/utils/BackHandlerManager';
import AnimatedView from '@/components/AnimatedView';
import { LinearGradient } from 'expo-linear-gradient';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'success';

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'google' | 'apple';
    label: string;
    icon: string;
    last4?: string;
}

interface ShippingInfo {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
}

const INITIAL_SHIPPING_INFO: ShippingInfo = {
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
};

const SAVED_ADDRESSES = [
    {
        id: '1',
        fullName: 'John Doe',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
        phone: '(555) 123-4567',
        isDefault: true
    },
    {
        id: '2',
        fullName: 'John Doe',
        address: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        country: 'United States',
        phone: '(555) 123-4567',
        isDefault: false
    }
];

const PAYMENT_METHODS: PaymentMethod[] = [
    { id: '1', type: 'card', label: 'Credit Card', icon: 'credit-card', last4: '4242' },
    { id: '2', type: 'paypal', label: 'PayPal', icon: 'dollar-sign' },
    { id: '3', type: 'google', label: 'Google Pay', icon: 'smartphone' },
    { id: '4', type: 'apple', label: 'Apple Pay', icon: 'smartphone' }
];

// Step Components
const ShippingStep = () => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0].id);
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<typeof SAVED_ADDRESSES[0] | null>(null);

    // Handle add new address
    const handleAddAddress = () => {
        setCurrentAddress({
            id: `${Date.now()}`,
            fullName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phone: '',
            isDefault: false
        });
        setIsAddressModalVisible(true);
    };

    // Handle save address
    const handleSaveAddress = () => {
        // In a real app, you would update the SAVED_ADDRESSES array
        setIsAddressModalVisible(false);
    };
    return (
        <View className="flex-1 p-4">


            <View className='w-full flex-row items-center justify-between mb-4'>
                <View>
                    <ThemedText className='text-2xl font-bold'>Shipping Address</ThemedText>
                    <ThemedText>Choose from saved addresses</ThemedText>
                </View>
                <AnimatedView animation="slideInRight" duration={700} delay={100} className='items-center pr-2' playOnlyOnce={true}>
                    <Image source={require('@/assets/img/delivery.png')} className='h-32 w-32' />
                </AnimatedView>
            </View>


            {SAVED_ADDRESSES.map(address => (
                <Selectable
                    key={address.id}
                    title={address.fullName}
                    description={`${address.address}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}\n${address.phone}`}
                    icon="MapPin"
                    selected={selectedAddress === address.id}
                    onPress={() => setSelectedAddress(address.id)}
                    containerClassName="mb-4"
                />
            ))}

            <Button
                title="Add New Address"
                iconStart="Plus"
                variant="outline"
                className="mb-8"
                onPress={handleAddAddress}
            />

            <Section title="Shipping options" titleSize='lg' className='mt-8 mb-4' />
            <Selectable
                title="Standard Shipping"
                icon="Truck"
                description='Estimated delivery: Dec 24 - Dec 26'
                selected={selectedMethod === 'standard'}
                onPress={() => setSelectedMethod('standard')}
            />
            <Selectable
                title="Express Shipping"
                icon="PlaneTakeoff"
                description='Estimated delivery: Dec 24 - Dec 26'
                containerClassName='mb-48'
                selected={selectedMethod === 'express'}
                onPress={() => setSelectedMethod('express')}
            />

            {/* Add Address Modal */}
            <Modal
                visible={isAddressModalVisible}
                transparent
                animationType="fade"
            >
                <View className="flex-1 bg-black/50 justify-center p-4">
                    <View className="bg-light-primary dark:bg-dark-primary rounded-xl p-4 pt-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <ThemedText className="text-xl font-semibold">
                                Add New Address
                            </ThemedText>
                            <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
                                <Icon name="X" size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className='pt-4'>
                            <Input
                                label="Full Name"
                                value={currentAddress?.fullName}
                                onChangeText={(text) =>
                                    setCurrentAddress(prev => prev ? { ...prev, fullName: text } : null)
                                }
                            />

                            <Input
                                label="Street Address"
                                value={currentAddress?.address}
                                onChangeText={(text) =>
                                    setCurrentAddress(prev => prev ? { ...prev, address: text } : null)
                                }
                            />

                            <Input
                                label="City"
                                value={currentAddress?.city}
                                onChangeText={(text) =>
                                    setCurrentAddress(prev => prev ? { ...prev, city: text } : null)
                                }
                            />

                            <Input
                                label="State"
                                value={currentAddress?.state}
                                onChangeText={(text) =>
                                    setCurrentAddress(prev => prev ? { ...prev, state: text } : null)
                                }
                            />

                            <Input
                                label="ZIP Code"
                                value={currentAddress?.zipCode}
                                onChangeText={(text) =>
                                    setCurrentAddress(prev => prev ? { ...prev, zipCode: text } : null)
                                }
                            />

                            <Input
                                label="Country"
                                value={currentAddress?.country}
                                onChangeText={(text) =>
                                    setCurrentAddress(prev => prev ? { ...prev, country: text } : null)
                                }
                            />

                            <Input
                                label="Phone Number"
                                value={currentAddress?.phone}
                                onChangeText={(text) =>
                                    setCurrentAddress(prev => prev ? { ...prev, phone: text } : null)
                                }
                            />

                            <View className="flex-row items-center justify-between py-4">
                                <ThemedText>Set as default address</ThemedText>
                                <Toggle
                                    value={currentAddress?.isDefault || false}
                                    onChange={(value: boolean) =>
                                        setCurrentAddress(prev => prev ? { ...prev, isDefault: value } : null)
                                    }
                                />
                            </View>
                        </ScrollView>

                        <View className="flex-row mt-4 gap-4">
                            <Button
                                title="Cancel"
                                variant="ghost"
                                className="flex-1"
                                onPress={() => setIsAddressModalVisible(false)}
                            />
                            <Button
                                title="Save"
                                className="flex-1"
                                onPress={handleSaveAddress}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const PaymentStep = () => {
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const colors = useThemeColors();

    // Payment methods similar to those in payments.tsx
    const paymentMethods = [
        { id: '1', type: 'visa', label: 'Visa', lastFour: '4242', expiryDate: '05/25', icon: 'CreditCard' as const },
        { id: '2', type: 'mastercard', label: 'Mastercard', lastFour: '5678', expiryDate: '08/24', icon: 'CreditCard' as const },
    ];

    // Handle add new card
    const handleAddCard = () => {
        setCardNumber('');
        setCardHolder('');
        setExpiryDate('');
        setCvv('');
        setIsDefault(false);
        setIsPaymentModalVisible(true);
    };

    // Handle save card
    const handleSaveCard = () => {
        // In a real app, you would add the new card to the payment methods array
        setIsPaymentModalVisible(false);
    };

    return (
        <View className="flex-1 p-4">

            <View className='w-full flex-row items-center justify-between mb-4'>
                <View>
                    <ThemedText className='text-2xl font-bold'>Payment method</ThemedText>
                    <ThemedText>Choose a payment method</ThemedText>
                </View>
                <AnimatedView animation="scaleIn" delay={100} duration={700} className='items-center' playOnlyOnce={true}>
                    <Image source={require('@/assets/img/payment.png')} className='h-32 w-32' />
                </AnimatedView>
            </View>

            {paymentMethods.map(method => (
                <Selectable
                    key={method.id}
                    title={`${method.label} ending in ${method.lastFour}`}
                    description={`Expires ${method.expiryDate}`}
                    customIcon={<Fontisto name={method.type === 'visa' ? 'visa' : 'mastercard'} size={22} color="black" />}
                    selected={selectedPayment === method.id}
                    onPress={() => setSelectedPayment(method.id)}
                    containerClassName="mb-4"
                />
            ))}

            <Selectable
                title="Apple Pay"
                customIcon={<AntDesign name="apple" size={24} color={colors.text} />}
                description="Pay using Apple Pay"
                selected={selectedPayment === 'apple'}
                onPress={() => setSelectedPayment('apple')}
                containerClassName="mb-4"
            />

            <Selectable
                title="Google Pay"
                customIcon={<AntDesign name="google" size={24} color={colors.text} />}
                description="Pay using Google Pay"
                selected={selectedPayment === 'google'}
                onPress={() => setSelectedPayment('google')}
                containerClassName='mb-4'
            />

            <Button
                title="Add New Card"
                iconStart="Plus"
                variant="outline"
                className="mb-8"
                onPress={handleAddCard}
            />

            {/* Add Card Modal */}
            <Modal
                visible={isPaymentModalVisible}
                transparent
                animationType="fade"
            >
                <View className="flex-1 bg-black/50 justify-center h-screen p-global">
                    <View className="bg-light-primary dark:bg-dark-primary rounded-xl p-4">
                        <View className="flex-row justify-between items-center mb-6">
                            <ThemedText className="text-xl font-semibold">Add New Card</ThemedText>
                            <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)}>
                                <Icon name="X" size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className=" pt-4">
                            <Input
                                label="Card Number"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                placeholder="1234 5678 9012 3456"
                                keyboardType="numeric"
                            />

                            <Input
                                label="Cardholder Name"
                                value={cardHolder}
                                onChangeText={setCardHolder}
                                placeholder="John Doe"
                            />

                            <View className="flex-row mb-4">
                                <Input
                                    label="Expiry Date"
                                    containerClassName="flex-1 mr-2"
                                    value={expiryDate}
                                    onChangeText={setExpiryDate}
                                    placeholder="MM/YY"
                                    inRow={true}
                                />

                                <Input
                                    label="CVV"
                                    containerClassName="flex-1 ml-2"
                                    value={cvv}
                                    onChangeText={setCvv}
                                    placeholder="123"
                                    keyboardType="numeric"
                                    secureTextEntry
                                    inRow={true}
                                />
                            </View>

                            <View className="flex-row items-center justify-between py-4 mb-4">
                                <ThemedText>Set as default payment method</ThemedText>
                                <Toggle
                                    value={isDefault}
                                    onChange={setIsDefault}
                                />
                            </View>
                        </ScrollView>

                        <View className="flex-row mt-4 gap-4 pt-2 border-t border-light-secondary dark:border-dark-secondary">
                            <Button
                                title="Cancel"
                                variant="ghost"
                                className="flex-1"
                                onPress={() => setIsPaymentModalVisible(false)}
                            />
                            <Button
                                title="Save Card"
                                className="flex-1"
                                onPress={handleSaveCard}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const ReviewStep = () => {
    const insets = useSafeAreaInsets();
    return (
        <ScrollView className="flex-1">
            <View className='w-full flex-row items-center justify-between mb-4 px-global'>
                <View className='flex-1'>
                    <ThemedText className='text-2xl font-bold'>Review order</ThemedText>
                    <ThemedText>Please check your order details</ThemedText>
                </View>
                <AnimatedView animation="scaleIn" delay={100} duration={700} className='items-center' playOnlyOnce={true}>
                    <Image source={require('@/assets/img/review.png')} className='h-32 w-32' />
                </AnimatedView>
            </View>

            {/* Products */}
            <View className="px-global pb-7 border-b-4 border-light-secondary dark:border-dark-darker">
                <ThemedText className="text-lg font-bold mb-4">Products</ThemedText>
                <View className="">
                    <View className="flex-row mb-4 items-center">
                        <Image source={require('@/assets/img/male-2.jpg')} className="w-20 h-28 rounded-lg" />
                        <View className="flex-1 ml-4">
                            <ThemedText className="font-bold">Classic White T-Shirt</ThemedText>
                            <ThemedText className="text-light-subtext dark:text-dark-subtext">Size: L • Color: White</ThemedText>
                            <ThemedText className="font-bold mt-1">$49.99</ThemedText>
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        <Image source={require('@/assets/img/female-2.jpg')} className="w-20 h-28 rounded-lg" />
                        <View className="flex-1 ml-4">
                            <ThemedText className="font-bold">Summer Dress</ThemedText>
                            <ThemedText className="text-light-subtext dark:text-dark-subtext">Size: M • Color: Blue</ThemedText>
                            <ThemedText className="font-bold mt-1">$59.99</ThemedText>
                        </View>
                    </View>
                </View>
            </View>

            {/* Shipping Address */}
            <View className="px-global py-7 border-b-4 border-light-secondary dark:border-dark-darker">
                <ThemedText className="text-lg font-bold mb-4">Shipping Address</ThemedText>
                <View className="">
                    <ThemedText className="font-bold">John Doe</ThemedText>
                    <ThemedText className="text-light-subtext dark:text-dark-subtext">
                        123 Main Street{'\n'}
                        Apt 4B{'\n'}
                        San Francisco, CA 94105{'\n'}
                        United States{'\n'}
                        (555) 123-4567
                    </ThemedText>
                </View>
            </View>

            {/* Payment Method */}
            <View className="px-global py-7 border-b-4 border-light-secondary dark:border-dark-darker">
                <ThemedText className="text-lg font-bold mb-4">Payment Method</ThemedText>
                <View className="rounded-lg flex-row items-center">
                    <Icon name="CreditCard" size={24} />
                    <View className="ml-4">
                        <ThemedText className="font-bold">Visa ending in 4242</ThemedText>
                        <ThemedText className="text-light-subtext dark:text-dark-subtext">Expires 12/25</ThemedText>
                    </View>
                </View>
            </View>

            {/* Delivery */}
            <View className="px-global py-7 border-b-4 border-light-secondary dark:border-dark-darker">
                <ThemedText className="text-lg font-bold mb-4">Estimated Delivery</ThemedText>
                <View className="rounded-lg flex-row items-center">
                    <Icon name="Truck" size={24} />
                    <View className="ml-4">
                        <ThemedText className="font-bold">Standard Shipping</ThemedText>
                        <ThemedText className="text-light-subtext dark:text-dark-subtext">Dec 24 - Dec 26</ThemedText>
                    </View>
                </View>
            </View>

            {/* Order Summary */}
            <View className="px-global py-7 border-b-4 border-light-secondary dark:border-dark-darker">
                <ThemedText className="text-lg font-bold mb-4">Order Summary</ThemedText>
                <View className=" rounded-lg">
                    <View className="flex-row justify-between mb-2">
                        <ThemedText>Subtotal</ThemedText>
                        <ThemedText>$109.98</ThemedText>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <ThemedText>Shipping</ThemedText>
                        <ThemedText>$9.99</ThemedText>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <ThemedText>Tax</ThemedText>
                        <ThemedText>$10.99</ThemedText>
                    </View>
                    <View className="h-[1px] bg-light-border dark:bg-dark-border my-2" />
                    <View className="flex-row justify-between">
                        <ThemedText className="font-bold">Total</ThemedText>
                        <ThemedText className="font-bold">$130.96</ThemedText>
                    </View>
                </View>
            </View>
            <View className='px-global' style={{ paddingBottom: insets.bottom }}>
                <Button title="Place Order" className='mt-4' />
            </View>
        </ScrollView>
    );
};

const CheckoutScreen = () => {
    const router = useRouter();
    const actionSheetRef = useRef<ActionSheetRef>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const backManager = BackHandlerManager.getInstance();

    // Ensure action sheet is shown/hidden correctly based on current step
    useEffect(() => {
        if (currentStep < 2) { // Show for shipping and payment steps (0 and 1)
            actionSheetRef.current?.show(0);
        } else { // Hide for review step (2)
            actionSheetRef.current?.hide();
        }
    }, [currentStep]);

    // Global reset of back handlers when component unmounts
    useEffect(() => {
        return () => {
            console.log('Checkout: Unmounting, resetting back handler manager');
            // Reset all handlers in the manager when checkout unmounts
            backManager.resetAll();
        };
    }, []);

    // Listen for app state changes to reset handlers when app comes to foreground
    useEffect(() => {
        // Listen for app state changes to clean up handlers when app comes back to foreground
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                console.log('App became active, resetting back handlers');
                backManager.resetAll();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const handleStepChange = (nextStep: number) => {
        setCurrentStep(nextStep);
        return true; // Allow the step change
    };

    const handleComplete = () => {
        console.log('Checkout: Completing order and navigating to order detail');
        // Reset all back handlers before navigating - this ensures a clean slate
        backManager.resetAll();
        // Handle order completion - pass an order ID and a fromCheckout flag
        router.push('/screens/order-detail?id=1&fromCheckout=true');
    };

    const handleClose = () => {
        console.log('Checkout: Closing checkout screen');
        // Clean exit - properly handle back button
        router.back();
    };

    return (
        <>
            <MultiStep
                onComplete={handleComplete}
                onClose={handleClose}
                showHeader={true}
                showStepIndicator={true}
                onStepChange={handleStepChange}
            >

                <Step title="Payment">
                    <PaymentStep />
                </Step>
                <Step title="Shipping">
                    <ShippingStep />
                </Step>



                <Step title="Review">
                    <ReviewStep />
                </Step>

                <Step title="Success">
                    <SuccessStep />
                </Step>
            </MultiStep>
        </>
    );
};

export default CheckoutScreen;

const SuccessStep = () => {
    return (
        <View className='flex-1'>
            <View className='w-full flex-row items-center justify-between mb-4 px-global'>
                <View className='flex-1'>
                    <ThemedText className='text-2xl font-bold'>Order placed</ThemedText>
                    <ThemedText>Your order id is #1234567890</ThemedText>
                </View>
                <View className='flex-row items-center'>
                    <AnimatedView animation="zoomInRotate" delay={200} duration={500} className='items-center border-2 border-light-primary dark:border-dark-primary rounded-xl' playOnlyOnce={true}>
                        <Image source={require('@/assets/img/female-2.jpg')} className='h-24 w-16 -mr-4 -rotate-6 rounded-xl' />
                    </AnimatedView>
                    <AnimatedView animation="zoomInRotate" delay={100} duration={500} className='items-center border-2 border-light-primary dark:border-dark-primary rounded-xl' playOnlyOnce={true}>
                        <Image source={require('@/assets/img/male-2.jpg')} className='h-28 w-20 rounded-xl' />
                    </AnimatedView>
                </View>
            </View>
            {/* Shipping Address */}
            <View className="px-global py-7 border-b-4 border-light-secondary dark:border-dark-darker">
                <ThemedText className="text-lg font-bold mb-4">Shipping Address</ThemedText>
                <View className="">
                    <ThemedText className="font-bold">John Doe</ThemedText>
                    <ThemedText className="text-light-subtext dark:text-dark-subtext">
                        123 Main Street{'\n'}
                        Apt 4B{'\n'}
                        San Francisco, CA 94105{'\n'}
                        United States{'\n'}
                        (555) 123-4567
                    </ThemedText>
                </View>
            </View>

            {/* Payment Method */}
            <View className="px-global py-7 border-b-4 border-light-secondary dark:border-dark-darker">
                <ThemedText className="text-lg font-bold mb-4">Payment Method</ThemedText>
                <View className="rounded-lg flex-row items-center">
                    <Icon name="CreditCard" size={24} />
                    <View className="ml-4">
                        <ThemedText className="font-bold">Visa ending in 4242</ThemedText>
                        <ThemedText className="text-light-subtext dark:text-dark-subtext">Expires 12/25</ThemedText>
                    </View>
                </View>
            </View>

            {/* Delivery */}
            <View className="px-global py-7 border-b-4 border-light-secondary dark:border-dark-darker">
                <ThemedText className="text-lg font-bold mb-4">Estimated Delivery</ThemedText>
                <View className="rounded-lg flex-row items-center">
                    <Icon name="Truck" size={24} />
                    <View className="ml-4">
                        <ThemedText className="font-bold">Standard Shipping</ThemedText>
                        <ThemedText className="text-light-subtext dark:text-dark-subtext">Dec 24 - Dec 26</ThemedText>
                    </View>
                </View>
            </View>
        </View>
    );
};