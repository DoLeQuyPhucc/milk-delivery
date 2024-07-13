import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { useNavigation } from '@/hooks/useNavigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchResultsScreen: React.FC<{ route: any }> = ({ route }) => {
  const navigation = useNavigation();
  const { packages } = useSelector((state: RootState) => state.packages);
  const searchQuery = route.params.query;

  const filteredPackages = packages.filter((pkg) =>
    pkg.products.some((product: any) =>
      product.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Search Results</Text>
      </View>
      <FlatList
        key={`flatlist_${2}`} // Force a fresh render by changing the key
        data={filteredPackages}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.packageContainer}
            onPress={() => navigation.navigate('PackageDetail', { id: item._id })}
          >
            <View style={styles.package}>
              <Image source={{ uri: item.products[0].product.productImage }} style={styles.productImage} />
              <Text style={styles.packageName}>{item.products[0].product.name}</Text>
              <Text style={styles.packagePrice}>
                {item.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  packageContainer: {
    flex: 1,
    margin: 8,
  },
  package: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 8,
  },
  packageName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  packagePrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
});

export default SearchResultsScreen;
