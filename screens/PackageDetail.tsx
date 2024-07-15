import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Animated, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackageById } from '@/redux/slices/packageDetailSlice';
import { RootState, AppDispatch } from '@/redux/store/store';
import { setUserID } from '@/redux/slices/cartSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Divider, Header } from 'react-native-elements';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import withRefreshControl from '@/components/withRefreshControl';
import { useNavigation } from '@/hooks/useNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

const PackageDetail: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const dispatch = useDispatch<AppDispatch>();
  const { package: packageDetail, status, error } = useSelector((state: RootState) => state.packageDetail);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleScroll = () => {
    setIsScrolling(true);
    const scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 100);
    clearTimeout(scrollTimeout);
  }

  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

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
      <Animated.ScrollView 
        contentContainerStyle={styles.contentContainer} 
        onScrollBeginDrag={handleScroll}
        onScrollEndDrag={handleScroll}
      >
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
          <Animatable.View animation="fadeInUp" duration={1000} style={styles.packageContainer}>
            <Image source={{ uri: packageDetail.products[0]?.product.productImage }} style={styles.image} />
            <Text style={styles.packageName}>{packageDetail.products[0]?.product.name || 'Package'}</Text>
            <Text style={styles.totalPriceDiscount}>
              {packageDetail.totalPriceDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Text>
            <Text style={styles.productCount}>Product Quantity: {packageDetail.products.length}</Text>
            {/* <Text style={styles.typeOfDelivery}>Type Of Delivery: {packageDetail.typeOfDelivery}</Text> */}
            <Text style={styles.numberOfShipment}>Number of deliveries: {packageDetail.numberOfShipment}</Text>
            <Text style={styles.discount}>Discount: {packageDetail.discount * 100}%</Text>
            <Divider style={styles.divider} />

            {packageDetail.products.map((item) => (
              <Animatable.View
                animation="fadeInUp"
                duration={1500}
                key={item.product._id}
                style={styles.productRow}
                onTouchEnd={() => handleProductPress(item.product)}
              >
                <Image source={{ uri: item.product.productImage }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productDescription}>{item.product.description}</Text>
                  <Text style={styles.productBrand}>Thương hiệu: {item.product.brandID.name}</Text>
                  <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
                </View>
                <Divider />
              </Animatable.View>
            ))}
          </Animatable.View>
        )}

        <Animatable.View animation="fadeInUp" duration={2000} style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: '#47CEFF' }]}
            onPress={() => navigation.navigate('OrderForm')}
          >
            <Text style={styles.orderButtonText}>Order</Text>
          </TouchableOpacity>
        </Animatable.View>

        {selectedProduct && (
          <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <Image source={{ uri: selectedProduct.productImage }} style={styles.modalImage} />
              <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
              <Text style={styles.modalBrand}>Thương hiệu: {selectedProduct.brandID.name}</Text>
              <Text style={styles.modalPrice}>
                Giá: {selectedProduct.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </Animated.ScrollView>
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
  packageContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
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
  totalPriceDiscount: {
    fontSize: 20,
    color: '#FF6F61',
    marginBottom: 10,
    textAlign: 'center',
  },
  productCount: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  typeOfDelivery: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  numberOfShipment: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  discount: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
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
    justifyContent: 'center',
    marginVertical: 20,
  },
  orderButton: {
    padding: 15,
    borderRadius: 30,
    width: '80%',
  },
  orderButtonText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalBrand: {
    fontSize: 14,
    marginBottom: 10,
  },
  modalPrice: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FF6F61',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default PackageDetail;
