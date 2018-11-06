import getMenuItems from './menuItems'
import locales from './locales'
import routes from './routes'
import themes from './themes'
import grants from './grants'

const config = {
  firebase_config: {
    apiKey: "AIzaSyCc1MLdq4Qkv0O2ruMdVnW1dCRLC1qv6T8",
    authDomain: "booking-hub.firebaseapp.com",
    databaseURL: "https://booking-hub.firebaseio.com",
    projectId: "booking-hub",
    storageBucket: "booking-hub.appspot.com",
    messagingSenderId: "558052510585"
  },
  firebase_config_dev: {
    apiKey: "AIzaSyCUHAM6VWnPyiFhvI8QgqLY8Fx910725Kk",
    authDomain: "bookings-hub-dev.firebaseapp.com",
    databaseURL: "https://bookings-hub-dev.firebaseio.com",
    projectId: "bookings-hub-dev",
    storageBucket: "bookings-hub-dev.appspot.com",
    messagingSenderId: "651991044866"
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
    locale: 'en'
  },
  drawer_width: 256,
  routes,
  getMenuItems,
  locales,
  themes,
  grants,
  firebaseLoad: () => import('./firebase')
}

export default config
