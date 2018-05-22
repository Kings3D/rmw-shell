import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import muiThemeable from '@material-ui/core/styles/muiThemeable';
import { injectIntl, intlShape } from 'react-intl';
import Activity from '../../../../src/containers/Activity'
import { setDialogIsOpen } from '../../../../src/store/dialogs/actions'
import { List, ListItem } from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import FontIcon from '@material-ui/core/FontIcon';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import { green800 } from '@material-ui/core/styles/colors';
import { BottomNavigation } from '@material-ui/core/BottomNavigation';
import { withRouter } from 'react-router-dom';
import FlatButton from '@material-ui/core/FlatButton';
import Dialog from '@material-ui/core/Dialog';
import { withFirebase } from 'firekit-provider'
import Scrollbar from '../../../../src/components/Scrollbar'

class Tasks extends Component {

  constructor(props) {
    super(props);
    this.name = null;
    this.listEnd = null
    this.new_task_title = null;
    this.state = { value: '' }
  }

  scrollToBottom = () => {
    const node = ReactDOM.findDOMNode(this.listEnd);
    node.scrollIntoView({ behavior: "smooth" });
  }

  componentDidUpdate(prevProps, prevState) {

    this.scrollToBottom();

  }

  componentDidMount() {
    const { watchList, firebaseApp } = this.props;

    let tasksRef = firebaseApp.database().ref('public_tasks').orderByKey().limitToLast(20);
    watchList(tasksRef)
    this.scrollToBottom();
  }

  handleKeyDown = (event, onSucces) => {
    if (event.keyCode === 13) {
      onSucces();
    }
  }

  handleAddTask = () => {
    const { auth, firebaseApp } = this.props;

    const title = this.name.getValue();

    const newTask = {
      title: title,
      created: firebase.database.ServerValue.TIMESTAMP,
      userName: auth.displayName,
      userPhotoURL: auth.photoURL,
      userId: auth.uid,
      completed: false
    }

    this.name.input.value = '';

    if (title.length > 0) {
      firebaseApp.database().ref('public_tasks').push(newTask);
    }



  }

  handleUpdateTask = (key, task) => {
    const { firebaseApp } = this.props;
    firebaseApp.database().ref(`public_tasks/${key}`).update(task);
  }


  userAvatar = (key, task) => {
    const { auth } = this.props;

    return task.completed ?
      <Avatar
        onClick={auth.uid === task.userId ? () => { this.handleUpdateTask(key, { ...task, completed: !task.completed }) } : undefined}
        alt="person"
        icon={<FontIcon className="material-icons" >done</FontIcon>}
        backgroundColor={green800}
      />
      :
      <Avatar
        src={task.userPhotoURL}
        onClick={auth.uid === task.userId ? () => { this.handleUpdateTask(key, { ...task, completed: !task.completed }) } : undefined}
        alt="person"
        icon={
          <FontIcon className="material-icons">
            person
        </FontIcon>
        }
      />
  }

  renderList(tasks) {
    const { auth, intl, history, browser, setDialogIsOpen } = this.props;

    if (tasks === undefined) {
      return <div></div>
    }

    return tasks.map((row, i) => {

      const task = row.val;
      const key = row.key;

      return <div key={key}>

        <ListItem
          key={key}
          onClick={task.userId === auth.uid ? () => { history.push(`/tasks/edit/${key}`) } : undefined}
          primaryText={task.title}
          secondaryText={`${task.userName} ${task.created ? intl.formatRelative(new Date(task.created)) : undefined}`}
          leftAvatar={this.userAvatar(key, task)}
          rightIconButton={
            task.userId === auth.uid ?
              <IconButton
                style={{ display: browser.lessThan.medium ? 'none' : undefined }}
                onClick={() => { setDialogIsOpen('delete_task_from_list', key); }}>
                <FontIcon className="material-icons" color={'red'}>{'delete'}</FontIcon>
              </IconButton> : undefined
          }
          id={key}
        />


        <Divider inset={true} />
      </div>
    });
  }

  handleClose = () => {
    const { setDialogIsOpen } = this.props;
    setDialogIsOpen('delete_task_from_list', undefined);
  }

  handleDelete = (key) => {
    const { firebaseApp, dialogs, unwatchList, watchList } = this.props;

    unwatchList('public_tasks');

    firebaseApp.database().ref(`public_tasks/${dialogs.delete_task_from_list}`).remove();

    let messagesRef = firebaseApp.database().ref('public_tasks').orderByKey().limitToLast(20);
    watchList(messagesRef)

    this.handleClose();

  }

  render() {
    const { intl, tasks, theme, dialogs } = this.props;


    const actions = [
      <FlatButton
        label={intl.formatMessage({ id: 'cancel' })}
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label={intl.formatMessage({ id: 'delete' })}
        secondary={true}
        onClick={this.handleDelete}
      />,
    ];

    return (
      <Activity
        isLoading={tasks === undefined}
        containerStyle={{ overflow: 'hidden' }}
        title={intl.formatMessage({ id: 'tasks' })}>

        <Scrollbar>

          <div style={{ overflow: 'none', backgroundColor: theme.palette.convasColor, paddingBottom: 56 }}>
            <List id='test' style={{ height: '100%' }} ref={(field) => { this.list = field; }}>
              {this.renderList(tasks)}
            </List>
            <div style={{ float: "left", clear: "both" }}
              ref={(el) => { this.listEnd = el; }}
            />
          </div>

        </Scrollbar>


        {tasks &&
          <BottomNavigation style={{ width: '100%', position: 'absolute', bottom: 0, right: 0, left: 0, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 15 }}>
              <TextField
                id="public_task"
                fullWidth={true}
                onKeyDown={(event) => { this.handleKeyDown(event, this.handleAddTask) }}
                ref={(field) => { this.name = field; this.name && this.name.focus(); }}
                type="Text"
              />
              <IconButton
                onClick={this.handleAddTask}>
                <FontIcon className="material-icons" color={theme.palette.primary1Color}>send</FontIcon>
              </IconButton>
            </div>
          </BottomNavigation>
        }

        <Dialog
          title={intl.formatMessage({ id: 'delete_task_title' })}
          actions={actions}
          modal={false}
          open={dialogs.delete_task_from_list !== undefined}
          onRequestClose={this.handleClose}>
          {intl.formatMessage({ id: 'delete_task_message' })}
        </Dialog>




      </Activity>
    );

  }

}

Tasks.propTypes = {
  intl: intlShape.isRequired,
  theme: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  const { lists, auth, browser, dialogs } = state;

  return {
    tasks: lists.public_tasks,
    auth,
    browser,
    dialogs
  };
};




export default connect(
  mapStateToProps,
  { setDialogIsOpen }
)(injectIntl(muiThemeable()(withRouter(withFirebase(Tasks)))));
