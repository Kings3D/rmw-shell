import React, { Component } from 'react'
import { render } from 'react-dom'
import configureStore from './store'
import { addLocalizationData } from 'k3d-shell/lib/config/locales'
import locales from './config/locales'
import * as serviceWorker from 'k3d-shell/lib/utils/serviceWorker'
import App from 'k3d-shell/lib'
import config from './config'
import A2HSProvider from 'a2hs'

addLocalizationData(locales)

class Demo extends Component {
  render() {
    return (
      <A2HSProvider>
        <App appConfig={{ configureStore, ...config }} />
      </A2HSProvider>
    )
  }
}

render(<Demo />, document.querySelector('#demo'))

serviceWorker.register()
