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

  const [loading, setLoading] = useState<boolean>(true);

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
                  <Image 
                    source={{ uri: 'data:image/jpeg;base64,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' }}
                    style={styles.iconImage}  
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                  />
                  <Text style={styles.iconText}>TH True Milk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => handleIconPress('66679ee91e0d9ffecd7df6d7')}>
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_Vinamilk_%282023%29.png'}} 
                    style={styles.iconImage} 
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                  />
                  <Text style={styles.iconText}>Vinamilk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => handleIconPress('6671d76bbb8c4bcf3267e486')}>
                  <Image 
                    source={{ uri: 'data:image/png;base64,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'}} 
                    style={styles.iconImage}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)} 
                  />
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
