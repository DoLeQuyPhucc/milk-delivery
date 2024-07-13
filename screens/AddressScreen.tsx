import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Title, Divider, List, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { useNavigation } from '@/hooks/useNavigation';
import { useFocusEffect } from '@react-navigation/native';

const AddressScreen: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const userID = useSelector((state: RootState) => state.user._id);
  const navigation = useNavigation();

  const fetchAddresses = async () => {
    try {
      const addressesJSON = await AsyncStorage.getItem(`addresses_${userID}`);
      const selectedAddressJSON = await AsyncStorage.getItem(`selectedAddress_${userID}`);
      if (addressesJSON) {
        const storedAddresses = JSON.parse(addressesJSON);
        setAddresses(storedAddresses);
        if (selectedAddressJSON) {
          const selectedAddress = JSON.parse(selectedAddressJSON);
          const updatedAddresses = [selectedAddress, ...storedAddresses.filter((addr: any) => addr.address !== selectedAddress.address)];
          setAddresses(updatedAddresses);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [userID])
  );

  const removeAddress = async (index: number) => {
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      await AsyncStorage.setItem(`addresses_${userID}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      Alert.alert('Thông báo', 'Đã xóa địa chỉ thành công.');
    } catch (error) {
      console.error('Không thể xóa địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể xóa địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleAddressChoose = async (selectedAddress: any) => {
    try {
      await AsyncStorage.setItem(`selectedAddress_${userID}`, JSON.stringify(selectedAddress));
      const updatedAddresses = [selectedAddress, ...addresses.filter((addr) => addr.address !== selectedAddress.address)];
      await AsyncStorage.setItem(`addresses_${userID}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save selected address:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Địa chỉ đã lưu</Title>
      <Divider style={styles.divider} />
      <List.Section>
        {addresses.map((addr, index) => (
          <List.Item
            key={index}
            title={`${addr.fullName}, ${addr.address}, ${addr.city}, ${addr.country}`}
            description={addr.phone}
            right={(props) => (
              <IconButton
                {...props}
                icon="delete"
                onPress={() => removeAddress(index)}
              />
            )}
            onPress={() => handleAddressChoose(addr)}
            style={index === 0 ? styles.selectedAddress : null}
          />
        ))}
      </List.Section>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddAddressScreen')}>
        <Title style={styles.addButtonText}>Thêm địa chỉ mới</Title>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 50,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#000',
  },
  addButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#47CEFF',
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  selectedAddress: {
    backgroundColor: '#cceeff',
  },
});

export default AddressScreen;
