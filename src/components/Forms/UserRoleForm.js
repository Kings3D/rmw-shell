import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { intlShape } from 'react-intl'
import { Field, reduxForm } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import SelectField from 'k3d-shell/lib/components/ReduxFormFields/SelectField'

const activeList = [
  {code: 'true', name: 'Active'},
  {code: 'false', name: 'InActive'}
]

class UserRoleForm extends Component {

  handleChange = (item) => input.onChange(item.code)

  render() {
    const {
      handleSubmit,
      intl,
      initialized,
      renderGrantItem,
      grants,
      roles
    } = this.props

    return (
      <form onSubmit={handleSubmit} style={{
        height: '100%',
        alignItems: 'stretch',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button type='submit'  />

        <div>
          <div>
          <SelectField
            name= 'active'
            items={activeList}
            itemToString={item => item ? item.name : ''}
            input={item => item ? item.name : ''}
            //onChange={(e) => { console.log(e); input.onChange(e.code) }}
            initialized={initialized}
            inputProps={{ label: 'Active', placeholder: 'Active/Inactive', helperText: 'testing', disabled: false, style: { width: 200 } }}
            ref='active'
            withref
          />
          </div>
          <div>
            <Field
              name='name'
              disabled={!initialized}
              component={TextField}
              hintText={intl.formatMessage({ id: 'name_hint' })}
              floatingLabelText={intl.formatMessage({ id: 'name_label' })}
              ref='name'
              withRef
            />
          </div>

          <div>
            <Field
              name='description'
              component={TextField}
              disabled={!initialized}
              hintText={intl.formatMessage({ id: 'description_hint' })}
              floatingLabelText={intl.formatMessage({ id: 'description_label' })}
              multiLine
              rows={2}
              ref='description'
              withRef
            />
          </div>

        </div>

      </form>
    )
  }
}

UserRoleForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  renderGrantItem: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  initialized: PropTypes.bool.isRequired,
  uid: PropTypes.string
}

export default reduxForm({ form: 'user_role' })(UserRoleForm)
