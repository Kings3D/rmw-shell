import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateTheme, switchNightMode } from '../../store/themeSource/actions'
import { updateLocale } from '../../store/locale/actions'
import { DrawerContent } from '../../components/Drawer'
import { setDialogIsOpen } from '../../store/dialogs/actions'
import isGranted, { isAnyGranted, isRole, isAnyRole } from '../../utils/auth'
import { userLogout } from '../../store/auth/actions'
import drawerActions from '../../store/drawer/actions'

DrawerContent.propTypes = {
  locale: PropTypes.string.isRequired,
  updateTheme: PropTypes.func.isRequired,
  updateLocale: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    isGranted: grant => isGranted(state, grant),
    isRole: role => isRole(state, role),
    isAnyGranted: grants => isAnyGranted(state, grants),
    isAnyRole: roles => isAnyRole(state, roles),
    ...state
  }
}

export default connect(
  mapStateToProps,
  { updateTheme, switchNightMode, updateLocale, setDialogIsOpen, userLogout, ...drawerActions }
)(DrawerContent)
