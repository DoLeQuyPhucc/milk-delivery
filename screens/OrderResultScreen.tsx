import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Image, BackHandler } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store/store';
import { fetchPackages } from '@/redux/slices/packageSlice';
import { Divider } from 'react-native-elements';
import { useNavigation } from '@/hooks/useNavigation';
import { useFocusEffect } from '@react-navigation/native';

interface Package {
  _id: string;
  products: {
    product: {
      brandID: {
        name: string;
      };
      name: string;
      productImage: string;
      description: string;
      price: number;
    };
    quantity: number;
  }[];
  totalAmount: number;
  totalPrice: number;
}

const OrderResultScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { packages, status, error } = useSelector((state: RootState) => state.packages);

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // Ngăn chặn việc quay lại
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const handleBuyAgain = () => {
    navigation.navigate('Main', {
      screen: 'Home',
    });
  };

  const handleViewOrders = () => {
    navigation.navigate('Main', {
      screen: 'Orders',
    });
  };

  const renderPackageItem = ({ item }: { item: Package }) => (
    <View style={styles.packageItem}>
      <Image source={{ uri: item.products[0].product.productImage }} style={styles.productImage} />
      <Text style={styles.packageName}>{item.products[0].product.name}</Text>
      <Text style={styles.brandName}>{item.products[0].product.brandID.name}</Text>
      <Text style={styles.productDescription}>{item.products[0].product.description}</Text>
      <Text style={styles.packagePrice}>
        {item.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.successMessage}>Order placed successfully!</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleBuyAgain}>
          <Text style={styles.buttonText}>Buy Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleViewOrders}>
          <Text style={styles.buttonText}>View Orders</Text>
        </TouchableOpacity>
      </View>
      <Divider style={styles.divider} />
      <Text style={styles.suggestionsTitle}>You might also like</Text>
      {status === 'loading' && <ActivityIndicator size="large" color="#fe7013" />}
      {status === 'failed' && <Text style={styles.errorText}>{error}</Text>}
      {status === 'succeeded' && (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  successMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#47CEFF',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  packageItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 10,
    width: '48%',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 10,
  },
  packageName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  brandName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  packagePrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default OrderResultScreen;
