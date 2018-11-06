import * as types from './types';

const initialState = {
  role: 'customer',
  company: 'default',
  active: true,
}

export default function role(state= initialState, action){
  const { payload } = action
  switch (action.type) {
    case types.ON_ROLE_CHANGED:
      return {...state, role: payload.role, company: payload.company, active: payload.active};
    default:
      return state;
  }

}
