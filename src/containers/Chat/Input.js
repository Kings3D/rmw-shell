import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import Input from '@material-ui/core/Input'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Mic from './Mic'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactList from 'react-list'
import Scrollbar from '../../components/Scrollbar'
import firebase from 'firebase'
import { connect } from 'react-redux'
import { getGeolocation } from '../../utils/googleMaps'
import { injectIntl, intlShape } from 'react-intl'
import { setSimpleValue } from '../../store/simpleValues/actions'
import { withFirebase } from 'firekit-provider'
import { withRouter } from 'react-router-dom'
import { withTheme } from '@material-ui/core/styles'

class ChatMessages extends Component {
  constructor(props) {
    super(props)
    this.name = null

    this.state = {
      value: ''
    }
  }

  componentDidMount() {
    const { watchList } = this.props

    watchList('predefined_chat_messages')
  }

  handleKeyDown = (event, onSucces) => {
    if (event.keyCode === 13) {
      onSucces()
    }
  }

  handleAddMessage = (type, message, key) => {
    const { auth, firebaseApp, path, intl } = this.props

    let newMessage = {
      created: firebase.database.ServerValue.TIMESTAMP,
      authorName: auth.displayName,
      authorUid: auth.uid,
      authorPhotoUrl: auth.photoURL,
      languageCode: intl.formatMessage({ id: 'current_locale', defaultMessage: 'en-US' }),
      type
    }

    if (type === 'image') {
      newMessage.image = message
    } else if (type === 'location') {
      newMessage.location = message
    } else if (type === 'audio') {
      newMessage.audio = message
    } else {
      if (message.startsWith('http') || message.startsWith('https')) {
        newMessage.link = message
        newMessage.type = 'link'
      } else {
        newMessage.message = message
      }
    }

    this.setState({ value: '' })

    this.name.state.hasValue = false

    if (message && message.length > 0) {
      if (key) {
        firebaseApp
          .database()
          .ref(`${path}/${key}`)
          .update(newMessage)
      } else {
        firebaseApp
          .database()
          .ref(path)
          .push(newMessage)
      }
    }
  }

  renderItem = i => {
    const { predefinedMessages, setSimpleValue } = this.props

    const key = predefinedMessages[i].key
    const message = predefinedMessages[i].val.message

    return (
      <div key={key}>
        <ListItem
          key={key}
          onClick={() => {
            setSimpleValue('chatMessageMenuOpen', false)
            this.setState({ value: message })
          }}
          id={key}
        >
          <ListItemText primary={message} />

          <IconButton
            color="primary"
            onClick={() => {
              setSimpleValue('chatMessageMenuOpen', false)
              this.handleAddMessage('text', message)
            }}
          >
            <Icon>send</Icon>
          </IconButton>
        </ListItem>
        <Divider inset={true} />
      </div>
    )
  }

  uploadSelectedFile = file => {
    const { firebaseApp, intl } = this.props

    if (file === null) {
      return
    }

    if ((file.size / 1024 / 1024).toFixed(4) > 20) {
      //file larger than 10mb
      alert(intl.formatMessage({ id: 'max_file_size' }))
      return
    }

    let reader = new FileReader()

    const key = firebaseApp
      .database()
      .ref('/user_chat_messages/')
      .push().key

    reader.onload = fileData => {
      let uploadTask = firebaseApp
        .storage()
        .ref(`/user_chats/${key}`)
        .putString(fileData.target.result, 'data_url')

      uploadTask.on(
        'state_changed',
        () => {},
        error => {
          console.log(error)
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            this.handleAddMessage('image', downloadURL, key)
          })
        }
      )
    }

    reader.readAsDataURL(file)
  }

  render() {
    const { theme, intl, setSimpleValue, chatMessageMenuOpen, predefinedMessages, path, receiverPath } = this.props

    return (
      <div
        style={{
          display: 'block',
          alignItems: 'row',
          justifyContent: 'center',
          height: chatMessageMenuOpen ? 300 : 56,
          backgroundColor: theme.palette.background.main,
          margin: 5,
          marginBottom: 15,
          marginRight: 15,
          marginLeft: 15
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            color={'primary'}
            onClick={() => {
              if (chatMessageMenuOpen === true) {
                setSimpleValue('chatMessageMenuOpen', false)
              } else {
                setSimpleValue('chatMessageMenuOpen', true)
              }
            }}
          >
            <Icon>{chatMessageMenuOpen === true ? 'keyboard_arrow_down' : 'keyboard_arrow_up'} </Icon>
          </IconButton>

          <div
            style={{
              backgroundColor: theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
              flexGrow: 1,
              height: 56,
              borderRadius: 30,
              paddingLeft: 8,
              paddingRight: 8,
              margin: 5
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <Input
                id="message"
                style={{
                  position: 'absolute',
                  height: 42,
                  width: 'calc(100% - 72px)',
                  lineHeight: undefined,
                  top: -5,
                  left: 15
                }}
                disableUnderline={true}
                onChange={e => {
                  this.setState({ value: e.target.value })
                }}
                fullWidth={true}
                value={this.state.value}
                autoComplete="off"
                placeholder={intl.formatMessage({ id: 'write_message_hint' })}
                onKeyDown={event => {
                  this.handleKeyDown(event, () => this.handleAddMessage('text', this.state.value))
                }}
                ref={field => {
                  this.name = field
                }}
                type="Text"
              />

              <div style={{ position: 'absolute', right: 25, top: -10, width: 20, height: 0 }}>
                <IconButton
                  color={'primary'}
                  onClick={() =>
                    getGeolocation(
                      pos => {
                        if (!pos) {
                          return
                        } else if (!pos.coords) {
                          return
                        }

                        const lat = pos.coords.latitude
                        const long = pos.coords.longitude
                        this.handleAddMessage(
                          'location',
                          `https://www.google.com/maps/place/${lat}+${long}/@${lat},${long}`
                        )
                      },
                      error => console.log(error)
                    )
                  }
                >
                  <Icon>my_location</Icon>
                </IconButton>
              </div>

              <input
                style={{ display: 'none' }}
                type="file"
                onChange={e => {
                  this.uploadSelectedFile(e.target.files[0])
                }}
                ref={input => {
                  this.fileInput = input
                }}
              />

              <div style={{ position: 'absolute', right: 55, top: -10, width: 20, height: 0 }}>
                <IconButton color={'primary'} containerElement="label" onClick={() => this.fileInput.click()}>
                  <Icon>photo</Icon>
                </IconButton>
              </div>
            </div>
          </div>

          {this.state.value !== '' && (
            <Button
              variant="fab"
              color={'primary'}
              disabled={this.state.value === undefined || this.state.value === ''}
              onClick={() => this.handleAddMessage('text', this.state.value)}
              aria-label="send"
            >
              <Icon>send</Icon>
            </Button>
          )}
          {this.state.value === '' && (
            <Mic receiverPath={receiverPath} handleAddMessage={this.handleAddMessage} path={path} />
          )}
        </div>
        {chatMessageMenuOpen && (
          <Scrollbar style={{ height: 200, backgroundColor: undefined }}>
            <div style={{ padding: 10, paddingRight: 0 }}>
              <ReactList
                itemRenderer={this.renderItem}
                length={predefinedMessages ? predefinedMessages.length : 0}
                type="simple"
              />
            </div>
          </Scrollbar>
        )}
      </div>
    )
  }
}

ChatMessages.propTypes = {
  intl: intlShape.isRequired,
  theme: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownPops) => {
  const { lists, auth, simpleValues } = state
  const { uid, path } = ownPops

  const chatMessageMenuOpen = simpleValues['chatMessageMenuOpen'] === true
  const imageDialogOpen = simpleValues.chatOpenImageDialog

  return {
    imageDialogOpen,
    simpleValues: simpleValues ? simpleValues : [],
    path,
    uid,
    chatMessageMenuOpen,
    predefinedMessages: lists['predefined_chat_messages'],
    auth
  }
}

export default connect(
  mapStateToProps,
  { setSimpleValue }
)(injectIntl(withTheme()(withRouter(withFirebase(ChatMessages)))))
