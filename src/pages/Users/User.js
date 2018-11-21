import Activity from 'k3d-shell/lib/containers/Activity'
import AppBar from '@material-ui/core/AppBar'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Scrollbar from 'k3d-shell/lib/components/Scrollbar'
import SearchField from 'k3d-shell/lib/components/SearchField'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import UserForm from 'k3d-shell/lib/components/Forms/UserForm'
import UserRoleForm from 'k3d-shell/lib/components/Forms/UserRoleForm'
import UserGrants from '../../containers/Users/UserGrants'
import UserRoles from '../../containers/Users/UserRoles'
import { change, submit } from 'redux-form'
import { connect } from 'react-redux'
import { filterSelectors, filterActions } from 'material-ui-filter'
import { formValueSelector } from 'redux-form'
import { getList, isLoading, getPath } from 'firekit'
import { injectIntl, intlShape } from 'react-intl'
import { setSimpleValue } from 'k3d-shell/lib/store/simpleValues/actions'
import { withFirebase } from 'firekit-provider'
import { withRouter } from 'react-router-dom'
import { withTheme, withStyles } from '@material-ui/core/styles'
import withAppConfigs from '../../utils/withAppConfigs'
import Input from '@material-ui/core/Input'
import { setDialogIsOpen } from '../../store/dialogs/actions'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import classNames from 'classnames'
import SelectField from 'k3d-shell/lib/components/ReduxFormFields/SelectField'

const path = '/users'
const form_name = 'user_role';

const activeList = [
  {code: 'true', name: 'Active'},
  {code: 'false', name: 'InActive'}
]

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
  },
  tabs: {
    flex: 1,
    width: '100%',
  },
  form: {
    backgroundColor: theme.palette.background.default,
    margin: 15,
    display: 'flex',
    justifyContent: 'center'
  }
});

export class User extends Component {

  state = {
    values: {
      active: true,
      company: '',
      role: 'customer',
      job: ''
    },
    roleData: {
      active: false,
      company: '',
      role: 'customer',
      job: ''
    },
    errors: {}
  }

  validate = (values) => {
    const { intl } = this.props;
    const errors = {}

    errors.name = !values.active ? intl.formatMessage({ id: 'error_required_field' }) : '';

    return errors
  }

  clean = (obj) => {
    Object.keys(obj).forEach((key) => (obj[key] === undefined) && delete obj[key]);
    return obj
  }


  submit = () => {
    const { firebaseApp, uid, history } = this.props;

    const roleData = this.state.roleData
    if (roleData.role === 'admin') {
      firebaseApp.database().ref(`/admins/${uid}`).set(true)
    } else {
      firebaseApp.database().ref(`/admins/${uid}`).remove()
    }
    firebaseApp.database().ref(`user_roles/${uid}`).set(this.clean(roleData)).then(() => {
      history.push('/users')
    })
  }

  componentDidMount() {
    const { watchList, uid, firebaseApp } = this.props
    watchList('admins')
    watchList('user_grants')

    firebaseApp.database().ref(`users/${uid}`).on('value', snap => {
      this.setState({ values: snap.val() })
    })


  }

  componentWillMount() {
    const { firebaseApp, uid } = this.props

    firebaseApp.database().ref(`user_roles/${uid}`).on('value', snap => {
      this.setState({ roleData: snap.val() })
    })
  }

  componentWillUnmount() {
    const { firebaseApp, uid } = this.props

    firebaseApp.database().ref(`users/${uid}`).off()
    firebaseApp.database().ref(`user_roles/${uid}`).off()
  }

  handleTabActive = (e, value) => {
    const { history, uid, rootPath, rootUid } = this.props

    if (rootPath) {
      history.push(`${path}/edit/${uid}/${value}/${rootPath}/${rootUid}`)
    } else {
      history.push(`${path}/edit/${uid}/${value}`)
    }

  }

  handleValueChange = (name, value) => {

    return this.setState({ values: { ...this.state.values, [name]: value } }, () => { this.validate() })
  }
  
  handleRoleChange = (name, value) => {

    return this.setState({ roleData: { ...this.state.roleData, [name]: value } }, () => { this.validate() })
  }

  handleAdminChange = (e, isInputChecked) => {
    const { firebaseApp, match } = this.props
    const uid = match.params.uid

    if (isInputChecked) {
      firebaseApp.database().ref(`/admins/${uid}`).set(true)
      firebaseApp.database().ref(`/user_roles/${uid}`).set({role: 'admin', company: 'default', active: true})
    } else {
      firebaseApp.database().ref(`/admins/${uid}`).remove()
      firebaseApp.database().ref(`/user_roles/${uid}`).set({role: 'customer', company: 'default', active: true})
    }

  }

  validate = () => {
    const { auth } = this.props;

    const errors = {}
    const values = this.state.values

    if (!values.active) {
      errors.displayName = 'Required'
    }


    this.setState({ errors })

  }

  handleDelete = () => {

    const { history, match, firebaseApp } = this.props;
    const uid = match.params.uid;

    if (uid) {
      firebaseApp.database().ref().child(`${path}/${uid}`).remove().then(() => {
        this.handleClose();
        history.goBack();
      })
    }
  }

  canSave = () => {

    const { auth } = this.props
    const values = this.state.values

    //if (Object.keys(this.state.errors).length) {
      //return false
    //}

    return true

  }



  render() {

    const {
      history,
      intl,
      dialogs,
      setDialogIsOpen,
      submit,
      theme,
      match,
      admins,
      companyList,
      userRoles,
      userJobs,
      firebaseApp,
      appConfig,
      editType,
      setFilterIsOpen,
      hasFilters,
      isLoading,
      classes
    } = this.props

    const {roleData} = this.state

    const uid = match.params.uid
    let isAdmin = false

    const companies = () => {
      var list = []
      companyList.map(row => {
        let dat = row.val
        let id = row.key
        list.push({code: id, name: dat.name})
      })  
      return list
    }

    const currCompany = () => {
      var coms = companies()
      var com = roleData.company
      var company = coms.find(obj => {
        return obj.code === com
      })
      return {value: company}
    }

    const comp = currCompany()

    const roleList = () => {
      var listing = []
      userRoles.map(row => {
        let dat = row.val
        let id = row.key
        listing.push({code: id, name: dat.name})
      })  
      return listing
    }

    const currRole = () => {
      const rols = roleList()
      const rol = roleData.role
      var role = rols.find(obj => {
        return obj.code === rol
      })
      return {value: role}
    }

    const currStatus = () => {
      //var coms = companies()
      var stat = roleData.active
      var status = activeList.find(obj => {
        return obj.code === stat
      })
      return {value: status}
    }

    const jobList = () => {
      var listing = []
      userJobs.map(row => {
        let dat = row.val
        let id = row.key
        listing.push({code: id, name: dat.name})
      })  
      return listing
    }

    const currJob = () => {
      const jobs = jobList()
      const jo = roleData.job
      var job = jobs.find(obj => {
        return obj.code === jo
      })
      return {value: job}
    }

    const stat = currStatus()
    const rol = currRole()
    const jo = currJob()

    if (admins !== undefined) {
      for (let admin of admins) {
        if (admin.key === uid) {
          isAdmin = true
          break
        }
      }
    }

    return (
      <Activity
        isLoading={isLoading}
        appBarContent={
          <div >
            {editType === 'role' &&
              <IconButton
                color="inherit"
                disabled={!this.canSave()}
                aria-label="open drawer"
                onClick={() => { this.submit() }}
              >
                <Icon className="material-icons" >save</Icon>
              </IconButton>
            }

            {editType === 'role' &&
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setDialogIsOpen('delete_role', true)}
              >
                <Icon className="material-icons" >delete</Icon>
              </IconButton>
            }

            {editType === 'grants' && <div style={{ display: 'flex' }}>
              <SearchField filterName={'user_grants'} />

              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setFilterIsOpen('user_grants', true)}
              >
                <Icon className="material-icons" color={hasFilters ? theme.palette.accent1Color : theme.palette.canvasColor}>filter_list</Icon>
              </IconButton>

            </div>
            }
          </div>
        }
        onBackClick={() => history.push('/users')}
        title={intl.formatMessage({ id: 'edit_user' })}>
        <Scrollbar style={{ height: '100%' }}>
          <div className={classes.root}>

            <AppBar position="static">
              <Tabs value={editType} onChange={this.handleTabActive} fullWidth centered >
                <Tab value="profile" icon={<Icon className="material-icons">person</Icon>} />
                <Tab value="role" icon={<Icon className="material-icons">account_box</Icon>} />
                {/*<Tab value="roles" icon={<Icon className="material-icons">account_box</Icon>} />
                <Tab value="grants" icon={<Icon className="material-icons">lock</Icon>} />*/}
              </Tabs>
            </AppBar>

            {editType === 'profile' && <div className={classes.form}>


              <UserForm
                handleAdminChange={this.handleAdminChange}
                isAdmin={isAdmin}
                values={this.state.values ? this.state.values : {}}
                {...this.props}
              />


            </div>}
            {editType === 'role' && <div className={classes.form}>


              <div style={{ margin: 15, display: 'flex', flexDirection: 'column' }}>
                <div>
                <SelectField
                  name= 'company'
                  items={companies()}
                  itemToString={item => item ? item.name : ''}
                  input={comp}
                  onChange={(e) => { this.handleRoleChange('company', e.code) }}
                  inputProps={{ label: 'Company', disabled: false, style: { width: 200 }, value:{currCompany} }}
                />
                </div>
                <div>
                <SelectField
                  name= 'role'
                  items={roleList()}
                  itemToString={item => item ? item.name : ''}
                  input={rol}
                  onChange={(e) => { this.handleRoleChange('role', e.code) }}
                  inputProps={{ label: 'Role', disabled: false, style: { width: 200 } }}
                />
                </div>
                <div>
                <SelectField
                  name= 'job'
                  items={jobList()}
                  itemToString={item => item ? item.name : ''}
                  input={jo}
                  onChange={(e) => { this.handleRoleChange('job', e.code) }}
                  inputProps={{ label: 'Job', disabled: false, style: { width: 200 } }}
                />
                </div>
                <div>
                <SelectField
                  name= 'active'
                  items={activeList}
                  itemToString={item => item ? item.name : ''}
                  input={stat}
                  onChange={(e) => { this.handleRoleChange('active', e.code) }}
                  inputProps={{ label: 'Active',disabled: false, style: { width: 200 } }}
                />
                </div>

              </div>
            </div>
            }
            {/*{editType === 'roles' && <UserRoles {...this.props} />}
            {editType === 'grants' && <UserGrants {...this.props} />}*/}

          </div>
        </Scrollbar>

        <Dialog
          open={dialogs.delete_role === true}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{intl.formatMessage({ id: 'delete_role_dialog_title' })}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {intl.formatMessage({ id: 'delete_role_dialog_message' })}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" >
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button onClick={this.handleDelete} color="secondary" >
              {intl.formatMessage({ id: 'delete' })}
            </Button>
          </DialogActions>
        </Dialog>

      </Activity>
    )
  }
}


User.propTypes = {
  history: PropTypes.object,
  intl: intlShape.isRequired,
  //submit: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  admins: PropTypes.array.isRequired,
}

const selector = formValueSelector('user')

const mapStateToProps = (state, ownProps) => {
  const { auth, intl, dialogs, lists, filters } = state
  const { match } = ownProps

  const uid = match.params.uid
  const editType = match.params.editType ? match.params.editType : 'data'
  const { hasFilters } = filterSelectors.selectFilterProps('user_grants', filters)
  const isLoadingRoles = isLoading(state, 'user_roles')
  const isLoadingGrants = isLoading(state, 'user_grants')
  const rootPath = match.params.rootPath
  const rootUid = match.params.rootUid
  const rolesPath = 'roles'
  

  let photoURL = ''
  let displayName = ''

  if (selector) {
    photoURL = selector(state, 'photoURL')
    displayName = selector(state, 'displayName')
  }

  return {
    rootPath,
    rootUid,
    hasFilters,
    auth,
    uid,
    dialogs,
    editType,
    intl,
    photoURL,
    displayName,
    userRoles: getList(state, rolesPath),
    userJobs: getList(state, 'jobs'),
    companyList: getList(state, 'companies'),
    admins: getList(state, 'admins'),
    user: getPath(state, `users/${uid}`),
    userRole: getPath(state, `user_roles/${uid}`),
    isLoading: isLoadingRoles || isLoadingGrants
  }
}

export default connect(
  mapStateToProps, { setDialogIsOpen, setSimpleValue, change, submit, ...filterActions }
)(injectIntl(withRouter(withFirebase(withStyles(styles, { withTheme: true })(withTheme()(User))))))
