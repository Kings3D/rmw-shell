import { createMuiTheme } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import pink from '@material-ui/core/colors/pink'
import green from '@material-ui/core/colors/green'
//import black from '@material-ui/core/colors/black'

export const themes = [
  {
    id: 'default',
    color: '#212121',
    source: {
      palette: {
        primary: '#212121'
      }
    }
  },
  {
    id: 'red',
    color: red[500],
    source: {
      palette: {
        primary: red,
        secondary: pink,
        error: red
      }
    }
  },
  {
    id: 'green',
    color: green[500],
    source: {
      palette: {
        primary: green,
        secondary: red,
        error: red
      }
    }
  }
]

const getThemeSource = (t, ts) => {
  if (ts) {
    for (let i = 0; i < ts.length; i++) {
      if (ts[i]['id'] === t.source) {
        const source = ts[i]['source']
        const palette = source != null ? source.palette : {}

        return createMuiTheme({ ...source, palette: { ...palette, type: t.isNightModeOn ? 'dark' : 'light' } })
      }
    }
  }

  return createMuiTheme({ palette: { type: t.isNightModeOn ? 'dark' : 'light' } }) // Default theme
}

export default getThemeSource
