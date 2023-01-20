import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';

import InitWallet from '../screens/initWallet/InitWalletScreen';
import CreateWallet from '../screens/initWallet/CreateWalletScreen';
import ImportWallet from '../screens/initWallet/ImportWalletScreen';

const screens = {
    Home: {
        screen: InitWallet,
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