import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackagesByBrandId } from '@/redux/slices/packageSlice';
import { RootState, AppDispatch } from '@/redux/store/store';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Define interface for package item
interface PackageItem {
  _id: string;
  products: {
    product: {
      productImage: string;
      name: string;
    };
  }[];
  totalPrice: number;
}

type RootStackParamList = {
  FilterResults: { brandID: string };
  PackageDetail: { id: string };
  Cart: undefined;
};

type FilterResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FilterResults'>;
type FilterResultsScreenRouteProp = RouteProp<RootStackParamList, 'FilterResults'>;

// Define a type for the brand names object keys
type BrandIDs = '66679ee91e0d9ffecd7df6d7' | '66679ee91e0d9ffecd7df6d8' | '6671d76bbb8c4bcf3267e486';

// Mock function to get brand name by ID
const getBrandNameById = async (brandID: BrandIDs): Promise<string> => {
  const brandNames: Record<BrandIDs, string> = {
    '66679ee91e0d9ffecd7df6d7': 'Vinamilk',
    '66679ee91e0d9ffecd7df6d8': 'TH True Milk',
    '6671d76bbb8c4bcf3267e486': 'Lothamilk',
  };
  return brandNames[brandID] || 'Unknown Brand';
};

const FilterResults: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<FilterResultsScreenNavigationProp>();
  const route = useRoute<FilterResultsScreenRouteProp>();
  const { packages, status, error } = useSelector((state: RootState) => state.packages);
  const [brandName, setBrandName] = useState<string>('');

  useEffect(() => {
    const fetchBrandName = async () => {
      const name = await getBrandNameById(route.params.brandID as BrandIDs);
      setBrandName(name);
    };

    fetchBrandName();
    dispatch(fetchPackagesByBrandId(route.params.brandID));
  }, [dispatch, route.params.brandID]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerButton}>
          <Ionicons name="cart" size={24} color="black" />
        </TouchableOpacity>
      ),
      title: brandName,
    });
  }, [navigation, brandName]);

  const renderPackageItem = ({ item }: { item: PackageItem }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PackageDetail', { id: item._id })} style={styles.package}>
      <Image source={{ uri: item.products[0].product.productImage }} style={styles.productImage} resizeMode="cover" />
      <Text numberOfLines={1} style={styles.packageName}>
        {item.products[0].product.name}
      </Text>
      <Text style={styles.packagePrice}>
        {item.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.brandNameText}>{`Brand: ${brandName}`}</Text>
      {status === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : status === 'failed' ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {typeof error === 'object' ? JSON.stringify(error) : error}</Text>
        </View>
      ) : packages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No packages found</Text>
        </View>
      ) : (
        <FlatList
          data={packages}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f7f7f7',
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  flatListContent: {
    paddingVertical: 16,
  },
  package: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  packageName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#d9534f',
  },
  brandNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
});

export default FilterResults;
