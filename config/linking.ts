import * as Linking from "expo-linking";

const prefix = Linking.createURL("/");

const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      WelcomeScreen: "welcome",
      LoginScreen: "login",
      RegisterScreen: "register",
      ProductDetail: "product-detail",
      PackageDetail: "package-detail",
      OrderForm: "order-form",
      OrderResult: "order-result",
      CartScreen: "cart",
      NotFound: "*",
    },
  },
};

export default linking;
