import * as types from './types'

export const setRole = (role, company, active) => {
  return {
    type: types.ON_ROLE_CHANGED,
    payload: {role, company, active}
  }
}

export default function roleData(user){
  let role = 'customer'
  let company = 'default'
  let active = true
  let job = ''
  return ((dispatch) => {
    user.getIdTokenResult()
      .then((idTokenResult) => {
        role = idTokenResult.claims.role
        company = idTokenResult.claims.company
        job = idTokenResult.claims.job
        active = idTokenResult.claims.active
        dispatch(setRole(role, company, job, active))
      })
      .catch((error) => {
        console.log('Error getting claims', error);
        //dispatch(logError(location, err))//todo
      })
  })

}