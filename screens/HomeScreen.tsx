import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackages } from '@/redux/slices/packageSlice';
import { RootState, AppDispatch } from '@/redux/store/store';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SkeletonLoader from '@/components/SkeletonHomeLoader';
import withRefreshControl from '@/components/withRefreshControl';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  PackageDetail: { id: string };
  CartScreen: undefined;
  OrderResult: undefined;
  SearchResults: { query: string };
  FilterResults: { brandID: string };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { packages, status, error } = useSelector((state: RootState) => state.packages);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchPackages());
    loadSearchHistory();
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchPackages());
    }, [dispatch])
  );

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const saveSearchHistory = async (query: string) => {
    try {
      const newHistory = [...new Set([query, ...searchHistory])].slice(0, 10);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      saveSearchHistory(searchQuery);
      navigation.navigate('SearchResults', { query: searchQuery });
      setSearchQuery('');
      setIsSearching(false);
    }
  };

  const handleSearchFocus = () => {
    setIsSearching(true);
  };

  const handleBackPress = () => {
    setIsSearching(false);
    Keyboard.dismiss();
  };

  const handleIconPress = (brandID: string) => {
    navigation.navigate('FilterResults', { brandID });
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <ScrollView>
          {status === 'loading' ? (
            <SkeletonLoader />
          ) : (
            <View style={styles.container}>
              <View style={styles.searchContainer}>
                {isSearching ? (
                  <>
                    <TouchableOpacity style={styles.arrowBack} onPress={handleBackPress}>
                      <Icon name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search..."
                      value={searchQuery}
                      onChangeText={(text) => setSearchQuery(text)}
                      onFocus={handleSearchFocus}
                      autoFocus
                    />
                    <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
                      <Icon name="search" size={24} color="#000" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search..."
                      onFocus={handleSearchFocus}
                    />
                    <View style={styles.iconContainer}>
                      <TouchableOpacity style={styles.iconButton}>
                        <Icon name="qr-code" size={24} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconButton}>
                        <Icon name="notifications" size={24} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
              <Image
                source={{ uri: 'https://cdn.tgdd.vn//News/1425889//sua-chua-th-true-milk-banner-845x264.png' }}
                style={styles.bannerImage}
              />
              <View style={styles.iconGroupContainer}>
                <TouchableOpacity style={styles.icon} onPress={() => handleIconPress('66679ee91e0d9ffecd7df6d8')}>
                  <Image source={require('@/assets/images/th-true-milk.png')} style={styles.iconImage} />
                  <Text style={styles.iconText}>TH True Milk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => handleIconPress('66679ee91e0d9ffecd7df6d7')}>
                  <Image source={require('@/assets/images/vinamilk.png')} style={styles.iconImage} />
                  <Text style={styles.iconText}>Vinamilk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => handleIconPress('6671d76bbb8c4bcf3267e486')}>
                  <Image source={require('@/assets/images/lothamilk.png')} style={styles.iconImage} />
                  <Text style={styles.iconText}>Lothamilk</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.promotionContainer}>
                <Text style={styles.promotionTitle}>Milk packages are on promotion</Text>
                <FlatList
                  horizontal
                  data={packages.slice(0, Math.ceil(packages.length / 2))}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('PackageDetail', { id: item._id })}>
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
                  showsHorizontalScrollIndicator={false}
                />
              </View>
              <View style={styles.featuredContainer}>
                <Text style={styles.featuredTitle}>Outstanding milk package</Text>
                <FlatList
                  horizontal
                  data={packages.slice(Math.ceil(packages.length / 2))}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('PackageDetail', { id: item._id })}>
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
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
  arrowBack: {
    marginRight: 10,
  },
  bannerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 10,
  },
  iconGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  icon: {
    alignItems: 'center',
  },
  iconImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
  },
  iconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  promotionContainer: {
    marginBottom: 20,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  package: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 10,
    marginRight: 10,
    width: 150,
    height: 180,
  },
  featuredContainer: {
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 10,
  },
  packageName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  packagePrice: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'red',
  },
});

export default withRefreshControl(HomeScreen);
