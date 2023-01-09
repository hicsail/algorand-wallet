import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';

import Home from '../screens/HomeScreen';
import CreateWallet from '../screens/CreateWalletScreen';
import ImportWallet from '../screens/ImportWalletScreen';

const screens = {
    Home: {
        screen: Home,
    },
    CreateWallet: {
        screen: CreateWallet
    },
    ImportWallet: {
        screen: ImportWallet
    }
}

const HomeStack = createStackNavigator(screens);

export default createAppContainer(HomeStack);