import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Checkbox from 'expo-checkbox';
import { GestureHandlerRootView, TouchableOpacity, Swipeable } from 'react-native-gesture-handler';
import { clearCart, updateCartQuantity, removeFromCart } from '@/redux/slices/cartSlice';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@/hooks/useNavigation';

const CartScreen = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleClearCart = () => {
    try {
      dispatch(clearCart());
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((itemId) => itemId !== id)
        : [...prevSelectedItems, id]
    );
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allItemIds = cartItems.map((item) => item.id);
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateCartQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleOrder = () => {
    // Order logic here
  };

  const handleDeleteSelectedItems = () => {
    if (selectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng chọn sản phẩm',
      });
      return;
    }

    setModalVisible(true);
  };

  const confirmDelete = () => {
    setLoading(true);
    setTimeout(() => {
      selectedItems.forEach((id) => handleRemoveItem(id));
      setLoading(false);
      setModalVisible(false);
      setSelectedItems([]);
      setSelectAll(false);
      Toast.show({
        type: 'success',
        text1: 'Bỏ sản phẩm thành công',
      });
    }, 1000);
  };

  const calculateTotalPrice = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Text style={styles.editButton}>{editMode ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <Swipeable
              key={item.id}
              renderRightActions={() => (
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemoveItem(item.id)}>
                  <Icon name="delete" size={24} color="white" />
                </TouchableOpacity>
              )}
            >
              <View style={styles.itemContainer}>
                <Checkbox
                  value={selectedItems.includes(item.id)}
                  onValueChange={() => handleSelectItem(item.id)}
                  color={selectedItems.includes(item.id) ? '#4630EB' : undefined}
                  style={styles.checkbox}
                />
                <Image source={{ uri: item.productImage }} style={styles.image} />
                <View style={styles.itemDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.priceText}>Price: {item.price}đ</Text>
                </View>
              </View>
            </Swipeable>
          ))
        ) : (
          <View style={styles.centered}>
            <Image source={require('../assets/images/cart-empty.png')} style={styles.cartImage} />
            <Text style={styles.emptyCartText}>There is nothing in the cart yet!</Text>
            <Text style={styles.emptyCartText}>Browse Milk Delivery, choose your products now!</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Main', { screen: 'Home' })}
              style={[styles.buttonBuyWhenEmpty]}
            >
              <Text style={{ color: '#FFFFFF' }}>Shop now!</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Checkbox value={selectAll} onValueChange={handleSelectAll} color={selectAll ? '#4630EB' : undefined} style={styles.checkbox} />
            <Text>Tất cả</Text>
          </View>
          {editMode ? (
            <View style={styles.editModeButtons}>
              <TouchableOpacity style={styles.editFooterButton}>
                <Text style={styles.editFooterButtonText}>Saved as liked</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editFooterButton} onPress={handleDeleteSelectedItems}>
                <Text style={styles.editFooterButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.orderContainer}>
              <Text style={styles.totalPriceText}>Total: {calculateTotalPrice()}đ</Text>
              <TouchableOpacity style={styles.orderButton} onPress={() => navigation.navigate('OrderForm')}>
                <Text style={styles.orderButtonText}>Purchase ({selectedItems.length})</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Do you want to remove {selectedItems.length} products?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmDelete}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="red" />
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 200
  },
  cartImage: {
    width: 100, 
    height: 100, 
    marginBottom: 20,
  },
  emptyCartText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonBuyWhenEmpty: {
    backgroundColor: '#47CEFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20
  },
  editButton: {
    fontSize: 16,
    color: '#47CEFF',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  checkbox: {
    marginRight: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  priceText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityText: {
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginBottom: 20
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalPriceText: {
    marginRight: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderButton: {
    backgroundColor: '#47CEFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editModeButtons: {
    flexDirection: 'row',
  },
  editFooterButton: {
    backgroundColor: '#47CEFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  editFooterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  editItemButton: {
    marginLeft: 10,
  },
});

export default CartScreen;
