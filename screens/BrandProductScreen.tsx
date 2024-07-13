import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackages } from '@/redux/slices/packageSlice';
import { RootState, AppDispatch } from '@/redux/store/store';

type Props = {
  route: { params: { brandId: string, brandName: string } };
};

const BrandProductsScreen: React.FC<Props> = ({ route }) => {
  const { brandId, brandName } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { packages, status, error } = useSelector((state: RootState) => state.packages);

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  const brandProducts = packages
    .flatMap((pkg) => pkg.products)
    .filter((product: any) => product.product.brandID._id === brandId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{brandName}</Text>
      {status === 'loading' ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={brandProducts}
          renderItem={({ item }) => (
            <View style={styles.productContainer}>
              <Image source={{ uri: item.product.productImage }} style={styles.productImage} />
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.productDescription}>{item.product.description}</Text>
              <Text style={styles.productPrice}>${item.product.price}</Text>
            </View>
          )}
          keyExtractor={(item) => item.product._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});

export default BrandProductsScreen;
