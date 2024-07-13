import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableHighlight, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store/store';
import { useFocusEffect } from '@react-navigation/native';
import {
  Appbar,
  TextInput,
  Button,
  RadioButton,
  Snackbar,
  Title,
  Paragraph,
  Divider,
  List,
} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callApi } from '@/hooks/useAxios';
import { useNavigation } from '@/hooks/useNavigation';
import { formatCurrency } from '@/utils/formatCurrency';

const OrderFormScreen: React.FC = () => {
  const { package: packageDetail } = useSelector((state: RootState) => state.packageDetail);
  const userID = useSelector((state: RootState) => state.user._id);

  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('Vietnam');
  const [paymentMethod, setPaymentMethod] = useState<string>('VNPay');
  const [numberOfShipment, setNumberOfShipment] = useState<string>('');
  const [deliveryCombo, setDeliveryCombo] = useState<string>('2-4-6');
  const [deliveredAt, setDeliveredAt] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [startDeliveryDate, setStartDeliveryDate] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]); // State to store addresses
  const [isBusy, setIsBusy] = useState<boolean>(false); // State to track if the form is busy

  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const fetchAddresses = useCallback(async () => {
    try {
      const storedAddresses = await AsyncStorage.getItem(`addresses_${userID}`);
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  }, [userID]);

  useEffect(() => {
    // Fetch addresses when component mounts
    fetchAddresses();
  }, [fetchAddresses]);

  useFocusEffect(
    useCallback(() => {
      // Fetch addresses when the screen is focused
      fetchAddresses();
    }, [fetchAddresses])
  );

  useEffect(() => {
    if (packageDetail) {
      if (numberOfShipment.trim() === '' || isNaN(parseInt(numberOfShipment))) {
        // Nếu số lần giao hàng không hợp lệ, set totalPrice về giá trị ban đầu từ packageDetail
        setTotalPrice(packageDetail.totalPrice);
      } else {
        // Tính lại totalPrice dựa trên packageDetail.totalPrice và numberOfShipment
        const newTotalPrice = packageDetail.totalPrice * parseInt(numberOfShipment);
        setTotalPrice(newTotalPrice);
      }
    }
  }, [packageDetail, numberOfShipment]);

  const loadAddress = async () => {
    try {
      const storedAddress = await AsyncStorage.getItem(`selectedAddress_${userID}`);
      if (storedAddress) {
        const addressData = JSON.parse(storedAddress);
        setFullName(addressData.fullName);
        setPhone(addressData.phone);
        setAddress(addressData.address);
        setCity(addressData.city);
        setCountry(addressData.country);
      }
    } catch (error) {
      console.error('Failed to load address from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    loadAddress();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAddress();
    });

    return unsubscribe;
  }, [navigation]);

  const handleNumberOfShipmentChange = (value: string) => {
    setNumberOfShipment(value);
  };

  const handleConfirm = (date: Date) => {
    setDatePickerVisibility(false);
  
    const selectedDay = date.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const validDays = deliveryCombo === '2-4-6' ? [1, 3, 5] : [2, 4, 6];
  
    if (!validDays.includes(selectedDay)) {
      Alert.alert(
        'Error',
        'Selected delivery date does not match the delivery days. Please choose a valid date.'
      );
      return;
    }
  
    // Convert the date to local date string
    const localDateString = date.toLocaleDateString('vi-VN');
  
    // Set the delivery date state
    setDeliveredAt(date);
    setStartDeliveryDate(localDateString);
  };
  
  
  const handleSubmit = async () => {
    if (!packageDetail) return;
  
    if (isBusy) {
      setSnackbarMessage('The system is busy. Please wait a moment.');
      setSnackbarVisible(true);
      return;
    }
  
    if (!fullName || !phone || !address || !city || !country || !numberOfShipment || !startDeliveryDate) {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarVisible(true);
      return;
    }
  
    const deliveryDayNums = deliveryCombo === '2-4-6' ? [1, 3, 5] : [2, 4, 6];
    const deliveryDay = deliveredAt.getDay();
  
    if (!deliveryDayNums.includes(deliveryDay)) {
      Alert.alert('Error', 'Selected delivery date does not match the delivery days.');
      return;
    }
  
    const numShipment = parseInt(numberOfShipment);
    if (isNaN(numShipment)) {
      Alert.alert('Error', 'Number of Shipments must be a valid number.');
      return;
    }
  
    const formattedDeliveredAt = deliveredAt.toISOString().split('T')[0];
    const formattedPaidAt = paymentMethod === 'VNPay' ? new Date().toISOString().split('T')[0] : null;
  
    const orderData = {
      packageID: packageDetail._id,
      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        country,
      },
      paymentMethod,
      userID,
      isPaid: paymentMethod === 'VNPay',
      paidAt: formattedPaidAt,
      deliveredAt: formattedDeliveredAt,
      numberOfShipment: numShipment,
    };
  
    console.log('Order data:', orderData);
  
    setIsBusy(true); // Set the form to busy state
  
    try {
      if (paymentMethod === 'VNPay') {
        await handleVNPayPayment(orderData, packageDetail.totalPrice * numShipment);
      } else {
        const response = await callApi('POST', '/api/orders', orderData);
        Alert.alert('Success', 'Order created successfully!');
        navigation.navigate('OrderResult', { orderData: JSON.stringify(response) });
      }
    } catch (error: any) {
      console.log("Error: ", error);
      
      if (error.response) {
        console.log("Server responded with:", error.response.data);
      } else if (error.request) {
        console.log("No response received:", error.request);
      } else {
        console.log("Error setting up the request:", error.message);
      }
  
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsBusy(false); // Reset the form to not busy state
    }
  };
  
  const handleVNPayPayment = async (orderData: any, amount: number) => {
    try {
      const response = await callApi('POST', '/api/payments/create_payment_url', {
        ...orderData,
        amount,
      });

      console.log("Order Data VNPay: ", orderData);
      
  
      const vnpUrl = response.vnpUrl;
      if (vnpUrl) {
        await WebBrowser.openBrowserAsync(vnpUrl);
  
        const returnResponse = await callApi('GET', '/api/payments/vnpay_return');
        if (returnResponse) {
          navigation.navigate('OrderResult', { vnpayData: JSON.stringify(returnResponse) });
        } else {
          Alert.alert('Error', 'Failed to get VNPay return data. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to initiate VNPay payment. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate VNPay payment. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Check out" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
        <View style={styles.section}>
          <Title style={styles.title}>Delivery address</Title>
            <List.Section>
              {/* Render saved address at index 0 */}
              {addresses.length === 0 ? (
                <List.Item
                  title="There are no addresses yet"
                  description="Click here to add a new address"
                  left={(props) => <List.Icon {...props} icon="map-marker" color="red" />}
                  onPress={() => navigation.navigate('AddressScreen')}
                />
              ) : (
                <List.Item
                  title={addresses[0].fullName}
                  description={`${addresses[0].address}, ${addresses[0].city}, ${addresses[0].country} - ${addresses[0].phone}`}
                  left={(props) => <List.Icon {...props} icon="map-marker" color="red" />}
                  onPress={() => navigation.navigate('AddressScreen')}
                />
              )}
            </List.Section>
          <Divider />
        </View>


          <View style={styles.section}>
            <Title style={styles.title}>Order details</Title>
            {packageDetail && (
              <View>
                {packageDetail.products.map((product, index) => (
                  <View key={index} style={styles.productDetailContainer}>
                    <Image source={{ uri: product.product.productImage }} style={styles.productImage} />
                    <View style={styles.productDetails}>
                      <Paragraph style={styles.productName}>{product.product.name}</Paragraph>
                      <Paragraph>Quantity: {product.quantity}</Paragraph>
                      <Paragraph>Price: {product.product.price}</Paragraph>
                      <Paragraph>Brand: {product.product.brandID.name}</Paragraph>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Title style={styles.title}>Payment methods</Title>
            <RadioButton.Group onValueChange={setPaymentMethod} value={paymentMethod}>
              <RadioButton.Item label="Pay with VNPay" value="VNPay" />
              <RadioButton.Item label="Payment upon delivery (COD)" value="COD" />
            </RadioButton.Group>
          </View>

          <View style={styles.section}>
            <Title style={styles.title}>Shipment Details</Title>
            <TextInput
              label="Number of deliveries"
              value={numberOfShipment}
              onChangeText={handleNumberOfShipmentChange}
              style={styles.input}
              mode='outlined'
              keyboardType="number-pad"
            />
            <TextInput
              label="Delivery start date"
              value={startDeliveryDate}
              onFocus={() => setDatePickerVisibility(true)}
              style={styles.input}
              mode='outlined'
            />
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              minimumDate={new Date()}
              onCancel={() => setDatePickerVisibility(false)}
              locale="vi-VN" // Set the locale for the date picker
            />
            <Paragraph>Choose delivery combo:</Paragraph>
            <RadioButton.Group onValueChange={(value) => {
              setDeliveryCombo(value);
              setStartDeliveryDate('');
            }} value={deliveryCombo}>
              <RadioButton.Item label="2-4-6 (Monday, Wednesday, Friday)" value="2-4-6" />
              <RadioButton.Item label="3-5-7 (Tuesday, Thursday, Saturday)" value="3-5-7" />
            </RadioButton.Group>
          </View>

          <View style={styles.section}>
            <Title style={styles.title}>Total</Title>
            <Paragraph style={{ color: 'red', fontWeight: 'bold' }}>
              {totalPrice !== null ? formatCurrency(totalPrice) : ''}
            </Paragraph>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            disabled={isBusy} // Disable the button when busy
          >
            {isBusy ? 'Processing...' : 'Order'}
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  productDetailContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#47CEFF'
  },
});

export default OrderFormScreen;
