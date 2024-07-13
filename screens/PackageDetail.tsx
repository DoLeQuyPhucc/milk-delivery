import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackageById } from '@/redux/slices/packageDetailSlice';
import { RootState, AppDispatch } from '@/redux/store/store';
import { CartItem, addToCart, setUserID } from '@/redux/slices/cartSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Divider, Header } from 'react-native-elements';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import withRefreshControl from '@/components/withRefreshControl';
import { useNavigation } from '@/hooks/useNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PackageDetail: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const dispatch = useDispatch<AppDispatch>();
  const { package: packageDetail, status, error } = useSelector((state: RootState) => state.packageDetail);
  const user = useSelector((state: RootState) => state.user);
  const toastRef = useRef<any>(null);

  const navigation = useNavigation();

  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const setUser = async () => {
      const userID = await AsyncStorage.getItem('userID');
      if (userID) {
        dispatch(setUserID(userID));
      }
    };
    setUser();
    dispatch(fetchPackageById(id));
  }, [dispatch, id]);

  // const handleIncrease = () => {
  //   setQuantity((prev) => prev + 1);
  // };

  // const handleDecrease = () => {
  //   if (quantity > 0) {
  //     setQuantity((prev) => prev - 1);
  //   }
  // };

  // const handleAddToCart = () => {
  //   if (packageDetail) {
  //     const cartItem: CartItem = {
  //       id: packageDetail._id,
  //       name: packageDetail.products[0]?.product.name || 'Unknown',
  //       price: packageDetail.totalPrice,
  //       quantity: quantity,
  //       productImage: packageDetail.products[0]?.product.productImage || '',
  //     };

  //     dispatch(addToCart(cartItem));
  //     if (toastRef.current) {
  //       toastRef.current.show({
  //         type: 'success',
  //         text1: 'Success',
  //         text2: 'Item added to cart successfully!',
  //       });
  //     }
  //   }
  // };

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (status === 'failed') {
    return <Text>Error: {error}</Text>;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Header
          leftComponent={{
            icon: 'arrow-back',
            color: 'black',
            onPress: () => navigation.goBack(),
          }}
          rightComponent={{
            icon: 'notifications',
            color: 'black',
          }}
          containerStyle={{ backgroundColor: '#f2f2f2' }}
        />
        {packageDetail && (
          <>
            <Image source={{ uri: packageDetail.products[0]?.product.productImage }} style={styles.image} />
            <Text style={styles.packageName}>{packageDetail.products[0]?.product.name || 'Package'}</Text>
            <Text style={styles.totalPrice}>
              {packageDetail.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Text>
            <Text style={styles.productCount}>Quantity Product: {packageDetail.products.length}</Text>
            <Divider style={styles.divider} />

            {packageDetail.products.map((item) => (
              <View key={item.product._id} style={styles.productRow}>
                <Image source={{ uri: item.product.productImage }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productDescription}>{item.product.description}</Text>
                  <Text style={styles.productBrand}>Brand: {item.product.brandID.name}</Text>
                  <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
                </View>
                <Divider />
              </View>
            ))}
          </>
        )}

        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity
            style={[styles.cartIconContainer, styles.iconButton, { backgroundColor: 'green' }]}
            onPress={handleAddToCart}
          >
            <Icon name="shopping-cart" size={24} color="#FFF" />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: '#47CEFF' }]}
            onPress={() => navigation.navigate('OrderForm')}
          >
            <Text style={styles.orderButtonText}>Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 0,
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  packageName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 20,
    color: '#FF6F61',
    marginBottom: 10,
    textAlign: 'center',
  },
  productCount: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  divider: {
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 14,
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIconContainer: {
    width: 60,
    height: 60,
  },
  orderButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default withRefreshControl(PackageDetail);
