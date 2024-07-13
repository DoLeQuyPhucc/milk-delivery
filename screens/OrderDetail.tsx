import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store/store';
import { callApi } from '@/hooks/useAxios';
import { fetchOrders } from '@/redux/slices/orderSlice';

const OrderDetailScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;

  console.log("OrderID: ", orderId);

  const dispatch = useDispatch<AppDispatch>();
  
  const order = useSelector((state: RootState) => 
    state.orders.orders.find(order => order._id === orderId)
  );
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);

  if (!order) {
    return (
      <View style={styles.noOrderContainer}>
        <Text style={styles.error}>No orders found</Text>
        <Button title="Go to Orders" onPress={() => navigation.navigate('Orders')} />
        <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }
  

  const handleReschedule = (trackingId: string) => {
    setSelectedTrackingId(trackingId);
    setDatePickerVisibility(true);
  };

  const handleConfirm = async (date: Date) => {
    setDatePickerVisibility(false);
    if (!selectedTrackingId) return;
    try {
      const response = await callApi("PUT", `/api/orders/updateDeliveryDate/${orderId}`, {
        trackingId: selectedTrackingId,
        newDeliveredAt: date.toISOString().split('T')[0],
      });
      console.log('Update Delivery Date Response:', response);
      dispatch(fetchOrders(order._id));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update delivery date');
      console.log('Error updating delivery date:', error);
      if (error.response) {
        console.log('Error response delivery data:', error.response.data);
        console.log('Error response delivery status:', error.response.status);
      }
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await callApi("PUT", `/api/orders/${orderId}/cancel`);
      console.log('Cancel Order Response:', response);
      dispatch(fetchOrders(order._id));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to cancel order');
      console.log('Error cancelling order:', error);
      if (error.response) {
        console.log('Error response cancel data:', error.response.data);
        console.log('Error response cancel status:', error.response.status);
      }
    }
  };

  const renderTracking = ({ item }: { item: any }) => (
    <View style={styles.trackingContainer}>
      <Text style={styles.trackingStatus}>Status: {item.status}</Text>
      <Text>Date: {item.deliveredAt}</Text>
      {item.status === 'Failed' ? (
        <>
          <Text>Reason: {item.reason}</Text>
          <Button title="Reschedule" onPress={() => handleReschedule(item._id)} />
        </>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Detail</Text>
      <FlatList
        data={order.circleShipment.tracking}
        keyExtractor={(item) => item._id}
        renderItem={renderTracking}
      />
      {order.status === 'Cancelled' ? (
        <Button
          title="Repurchase"
          onPress={() => navigation.navigate('PackageDetail', { packageId: order.package._id })}
        />
      ) : (
        <Button title="Cancel Order" onPress={handleCancelOrder} />
      )}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        minimumDate={new Date()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  trackingContainer: {
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
  trackingStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default OrderDetailScreen;
