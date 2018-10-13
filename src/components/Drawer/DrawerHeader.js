import Avatar from '@material-ui/core/Avatar'
import Icon from '@material-ui/core/Icon'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import { withTheme, withStyles } from '@material-ui/core/styles'
import withAppConfigs from '../../utils/withAppConfigs'
import { injectIntl } from 'react-intl'
import IconButton from '@material-ui/core/IconButton'
import Hidden from '@material-ui/core/Hidden'
import withWidth from '@material-ui/core/withWidth'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import PersonIcon from '@material-ui/icons/Person'
import BackgroundHeader from '../../../demo/public/background_orig.png'

const styles = theme => ({
  paper: {
    //backgroundColor: theme.palette.primary.dark,
    backgroundImage: 'url('+ BackgroundHeader+')',
    margin: 0,
    padding: 0
  },
  listItem: {
    color: theme.palette.primary.contrastText
  },
  icon: {
    color: theme.palette.primary.contrastText
  },
  toolbar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...theme.mixins.toolbar
  },
  button: {
    // width: 15
  }

})

export const DrawerHeader = (props) => {
  const {
    theme,
    intl,
    auth,
    dialogs,
    setDialogIsOpen,
    classes,
    drawer,
    setDrawerOpen,
    setDrawerUseMinified,
    width
  } = props

  return (
    <Paper className={classes.paper}>
      {/*<div className={classes.toolbar} />*/}
      {auth.isAuthorised &&
        <div>
          <List >

            <ListItem>
              {auth.photoURL && <ListItemAvatar><Avatar src={auth.photoURL} alt='user' /></ListItemAvatar>}
              {!auth.photoURL && <ListItemAvatar><Avatar> <PersonIcon />  </Avatar></ListItemAvatar>}
              <Hidden smDown implementation='css'>
                <ListItemSecondaryAction>
                  <IconButton onClick={() => { setDrawerOpen(false) }}>
                    <Icon classes={{ root: classes.icon }} >chrome_reader_mode</Icon>
                  </IconButton>
                  <IconButton className={classes.button} onClick={() => { setDrawerUseMinified(true) }}>
                    <Icon classes={{ root: classes.icon }} >{theme.direction === 'rtl' ? 'chevron_right' : 'chevron_left'}</Icon>
                  </IconButton>

                </ListItemSecondaryAction>
              </Hidden>
            </ListItem>

            <ListItem onClick={() => { setDialogIsOpen('auth_menu', !dialogs.auth_menu) }} >

              {width !== 'sm' && width !== 'xs' && auth.photoURL && <ListItemAvatar>
                <Avatar src={auth.photoURL} alt='person' style={{ marginLeft: -18, marginTop: 3 }} />
              </ListItemAvatar>
              }

              {width !== 'sm' && width !== 'xs' && !auth.photoURL && <ListItemAvatar>
                <Avatar style={{ marginLeft: -18, marginTop: 3 }}> <PersonIcon />  </Avatar>
              </ListItemAvatar>
              }

              {drawer.open && <ListItemText style={{ marginLeft: -8 }} classes={{ primary: classes.listItem, secondary: classes.listItem }} primary={auth.displayName} secondary={auth.email} />}
              {drawer.open && <ListItemSecondaryAction onClick={() => { setDialogIsOpen('auth_menu', !dialogs.auth_menu) }}>
                <IconButton >
                  <Icon classes={{ root: classes.icon }} >{dialogs.auth_menu ? 'arrow_drop_up' : 'arrow_drop_down'}</Icon>
                </IconButton>
              </ListItemSecondaryAction>
              }
            </ListItem>
          </List>
        </div>
      }

      {!auth.isAuthorised &&
        <List>
          <ListItem >
            <ListItemText classes={{ primary: classes.listItem }} primary={intl.formatMessage({ id: 'app_name' })} />
            <Hidden smDown implementation='css'>
              <ListItemSecondaryAction>
                <IconButton className={classes.button} onClick={() => { setDrawerUseMinified(false) }}>

                  {theme.direction === 'rtl' && <ChevronRight classes={{ root: classes.icon }} />}
                  {theme.direction !== 'rtl' && <ChevronLeft classes={{ root: classes.icon }} />}

                </IconButton>
              </ListItemSecondaryAction>
            </Hidden>
          </ListItem>
        </List>

      }
    </Paper>
  )
}

export default injectIntl(withWidth()(withTheme()(withAppConfigs(withStyles(styles, { withTheme: true })(DrawerHeader)))))
