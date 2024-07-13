import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Text, View, Image, FlatList, StyleSheet } from 'react-native';
import { AppDispatch, RootState } from '@/redux/store/store';
import { fetchOrders, makeSelectOrdersByStatus, selectOrdersLoading, selectOrdersError } from '@/redux/slices/orderSlice';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@/hooks/useNavigation';
import { useFocusEffect } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const OrderScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userID = useSelector((state: RootState) => state.user._id);

  useFocusEffect(
    useCallback(() => {
      if (userID) {
        dispatch(fetchOrders(userID));
      }
    }, [dispatch, userID])
  );

  return (
    <Tab.Navigator>
      <Tab.Screen name="Pending" children={() => <OrderList status="Pending" />} />
      <Tab.Screen name="Out for Delivery" children={() => <OrderList status="Out for Delivery" />} />
      <Tab.Screen name="Delivered" children={() => <OrderList status="Delivered" />} />
      <Tab.Screen name="Cancelled" children={() => <OrderList status="Cancelled" />} />
    </Tab.Navigator>
  );
};

const OrderList = ({ status }: { status: string }) => {
  const selectOrdersByStatus = React.useMemo(() => makeSelectOrdersByStatus(status), [status]);
  const orders = useSelector(selectOrdersByStatus);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const navigation = useNavigation();

  const renderProduct = ({ item: productItem }: { item: any }) => (
    <View style={styles.productContainer}>
      <Image source={{ uri: productItem.product.productImage }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.productName}>{productItem.product.name}</Text>
        <Text style={styles.description}>{productItem.product.description}</Text>
        <Text style={styles.price}>Price: {productItem.product.price} VND</Text>
        <Text style={styles.quantity}>Quantity: {productItem.quantity}</Text>
      </View>
    </View>
  );

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderContainer}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.header}>Order Date: {item.deliveredAt}</Text>
        <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>
      <FlatList
        data={item.package.products}
        keyExtractor={(product) => product._id}
        renderItem={renderProduct}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Price:</Text>
        <Text style={styles.totalPrice}>{item.package.totalPrice} VND</Text>
      </View>
      <View style={styles.deliveryInfo}>
        <Text style={styles.deliveryLabel}>Shipments Delivered:</Text>
        <Text style={styles.deliveryCount}>
          {item.circleShipment.tracking.filter((track: any) => track.isDelivered).length} / {item.circleShipment.numberOfShipment}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={renderOrder}
    />
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Pending':
      return styles.pending;
    case 'Out for Delivery':
      return styles.outForDelivery;
    case 'Delivered':
      return styles.delivered;
    case 'Cancelled':
      return styles.cancelled;
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  orderContainer: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pending: {
    color: 'orange',
  },
  outForDelivery: {
    color: 'blue',
  },
  delivered: {
    color: 'green',
  },
  cancelled: {
    color: 'red',
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 8,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: 'gray',
  },
  price: {
    fontSize: 14,
  },
  quantity: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveryCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderScreen;
