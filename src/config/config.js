import configureStore from '../store'
import getMenuItems from './menuItems'
import grants from './grants'
import locales from './locales'
import { RMWIcon } from '../components/Icons'
import { themes } from './themes'

const config = {
    firebase_config: {
        apiKey: "xxxxxx",
        authDomain: "ccccc-hub.firebaseapp.com",
        databaseURL: "https://cccc-hub.firebaseio.com",
        projectId: "cccc-hub",
        storageBucket: "cccc-hub.appspot.com",
        messagingSenderId: "xxxxx"
    },
    firebase_config_dev: {
        apiKey: "xxxxxx",
        authDomain: "bookings-hub-dev.firebaseapp.com",
        databaseURL: "https://bookings-hub-dev.firebaseio.com",
        projectId: "bookings-hub-dev",
        storageBucket: "bookings-hub-dev.appspot.com",
        messagingSenderId: "xxxxxxx"
    },
    firebase_providers: [
        'google.com',
        'facebook.com',
        'twitter.com',
        'github.com',
        'password',
        'phone'
    ],
    initial_state: {
        theme: 'dark',
        locale: 'en'
    },
    drawer_width: 240,
    appIcon: RMWIcon,
    configureStore,
    getMenuItems,
    locales,
    themes,
    grants,
    routes: [],
    onAuthStateChanged: undefined,
    notificationsReengagingHours: 48,
    firebaseLoad: () => import('./firebase'),
    getNotifications: (notification, props) => {
        const { history } = props;
        return {
            chat: {
                path: 'chats',
                autoClose: 5000,
                //getNotification: () => <div>YOUR CUSTOM NOTIFICATION COMPONENT</div>,
                onClick: () => { history.push(`/chats`) },
                ...notification
            }
        }
    }
}

export default config
