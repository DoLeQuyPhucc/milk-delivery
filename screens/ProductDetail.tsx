import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '@/redux/slices/productDetailSlice';
import { RootState, AppDispatch } from '@/redux/store/store';
import { CartItem, addToCart } from '@/redux/slices/cartSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Divider, Header } from 'react-native-elements';
import { useRouter } from 'expo-router';

type RootStackParamList = {
  ProductDetail: { id: string };
};

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { id } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { product, status, error } = useSelector((state: RootState) => state.productDetail);
  const toastRef = useRef<any>(null);

  const router = useRouter();

  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1);
    }
  };

// const handleAddToCart = () => {
//   if (product) {
//     const cartItem: CartItem = {
//       id: product._id,
//       name: product.name,
//       price: product.price,
//       quantity: quantity,
//       productImage: product.productImage || '',
//       brandID: {
//         name: product.brandID?.name || '',
//       },
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
  

  const handleOrder = () => {
    // Order logic here
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
    <View style={styles.container}>
      <Header
        leftComponent={{
          icon: 'arrow-back',
          color: 'black',
          onPress: () => router.back(),
        }}
        rightComponent={{
          icon: 'shopping-cart',
          color: 'black',
          onPress: () => router.push('CartScreen'),
        }}
        containerStyle={{ backgroundColor: '#f2f2f2' }}
      />
      {product && (
        <>
          <Image source={{ uri: product.productImage }} style={styles.image} />
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
          <Text style={styles.brand}>
            <Icon name="label" size={15} color="#000" />
            {product.brandID.name}
          </Text>
          <Text style={styles.stock}>Kho hàng: {product.stockQuantity}</Text>
          <Divider />
          <Text style={styles.titleDescription}>Mô tả</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={handleDecrease}>
              <Icon name="remove" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} disabled={quantity >= product.stockQuantity}  onPress={handleIncrease}>
              <Icon name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cartIconContainer, styles.iconButton, { backgroundColor: quantity === 0 ? '#ccc' : 'green' }]}
              disabled={quantity === 0}
              // onPress={handleAddToCart}
            >
              <Icon name="shopping-cart" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.orderButton, { backgroundColor: quantity === 0 ? '#ccc' : '#FF6F61' }]}
              disabled={quantity === 0}
              onPress={handleOrder}
            >
              <Text style={styles.orderButtonText}>Đặt hàng</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 16
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  brand: {
    fontSize: 15,
    color: '#888',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F61',
    marginBottom: 10,
  },
  titleDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  stock: {
    fontSize: 16,
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  iconButton: {
    padding: 16,
    width: 50, 
    height: 50, 
    marginRight: 10, 
  },
  orderButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ProductDetail;
