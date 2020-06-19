require('styles/Widget.scss');

import config from 'config';
import React, { Component } from 'react';
import { connect } from 'react-redux'
import StatusContainer from 'components/StatusContainer';
import MessageList from 'components/MessageList';
import ChatButton from 'components/ChatButton';
import Input from 'components/Input';

import { log, get, set, isAgent } from 'utils';
import moment from 'moment'

import { debounce } from 'lodash';
import zChat from 'vendor/web-sdk';
import * as FlexWebChat from "@twilio/flex-webchat-ui";

const { ENV, ACCOUNT_KEY, THEME, TWILIO_CONFIG } = config;

if (ENV === 'dev') {
  window.zChat = zChat;
}

class App extends Component {
  constructor() {
    super();

    const channelSid = localStorage.getItem("twilio-flex-cf") &&
      JSON.parse(localStorage.getItem("twilio-flex-cf")).flex.session.channelSid || null;
    this.state = {
      theme: THEME,
      typing: false,
      visible: false,
      channelSid,
      toZendesk: true
    };

    this.timer = null;
    this.listenTwilioEvents = this.listenTwilioEvents.bind(this);
    this.webChatInitListener = this.webChatInitListener.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.getVisibilityClass = this.getVisibilityClass.bind(this);
    this.minimizeOnClick = this.minimizeOnClick.bind(this);
    this.chatButtonOnClick = this.chatButtonOnClick.bind(this);
    this.mapToEntities = this.mapToEntities.bind(this);
    this.isOffline = this.isOffline.bind(this);
    this.stopTyping = debounce(this.stopTyping.bind(this), 1000);
    this.setVisible = this.setVisible.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
  }

  componentDidMount() {
    zChat.init({
      account_key: ACCOUNT_KEY
    });

    FlexWebChat.createWebChat(TWILIO_CONFIG)
      .then(this.webChatInitListener)
      .catch(error => console.error(error));

    const events = [
      'account_status',
      'connection_update',
      'department_update',
      'visitor_update',
      'agent_update',
      'chat',
      'error'
    ];

    events.forEach((evt) => {
      zChat.on(evt, (data) => {
        if (this.state.toZendesk) {
          if (data.type == 'chat.msg' && isAgent(data.nick) && data.msg.startsWith('#TransferToTwilio')){
            var messagesHistoric = this.parseMessagesHistoric(this.props.data && this.props.data.chats.toArray());
            this.setState({toZendesk: false})
            this.genericSendMessage(messagesHistoric, false);
          } else {
            this.props.dispatch({
              type: evt,
              detail: data
            });
          }
        }
      });
    });

    // Expose onThemeChange to allow dynamic change of theme
    if (ENV === 'dev') {
      window.onThemeChange = this.onThemeChange.bind(this);
    }

    this.setState({
      visible: get('visible') || this.state.visible,
      theme: get('theme') || this.state.theme
    });
  }

  webChatInitListener(webChat) {
    const {manager} = webChat;
    let channelSid = this.state.channelSid;

    if (!channelSid) {
      FlexWebChat.Actions.invokeAction(
        "StartEngagement", { formData: { "friendlyName":"Customer" } }
      ).then((channelSid) => {
        this.setState({ channelSid })
        this.listenTwilioEvents(manager, channelSid)
      });
    } else {
      this.listenTwilioEvents(manager, channelSid)
    }
  }

  async listenTwilioEvents(manager, channelSid) {
    const channel = await manager.chatClient.getChannelBySid(channelSid)

    channel.on('messageAdded', resp => {
      if (!this.state.toZendesk && resp.state.author == resp.services.users.fifoStack[0]) {
        // Verifica se da Twilio veio o Código de transferência para o ZD
        if (resp.body.startsWith("#zd")) {
          // Se veio com esse código não é feito o dispatch para salvar a mensagem
          var messagesHistoric = this.parseMessagesHistoric(this.props.data && this.props.data.chats.toArray());
            this.setState({toZendesk: true})
            this.genericSendMessage(messagesHistoric, false);
        } else {
          // Salva as mensagens usando esse dispatch personalizado fazendo um "parse" de dados vindo da Twilio
          this.props.dispatch({
            type: 'synthetic',
            detail: {
              type: 'agent_sended_msg',
              nick: `agent:${resp.author}`,
              display_name: resp.author,
              msg: resp.body
            }
          });
        }
      }
    })
  }

  parseMessagesHistoric(objectMessages) {
    // Código para pular o fluxo do studio e ir direto para atendimento do agente
    let messages = '#FromTransfer ------------------\n \n';

    objectMessages.forEach(function (item) {
      if (item.type == "chat.msg") {
          messages += `[${item.member_type}] ${item.display_name} (${moment(item.timestamp).format('DD/MM/YYYY - hh:mm:ss')}):\n${item.msg} \n \n`;
      }
    })

    return messages;
  }

  routeTwilioMsg() {
    this.setState({toZendesk: true})
  }

  handleOnChange() {
    if (!this.state.typing) {
      zChat.sendTyping(true);
      this.setState({ typing: true });
    }
    this.stopTyping();
  }

  stopTyping() {
    if (!this.state.typing) return;

    zChat.sendTyping(false);
    this.setState({ typing: false });
  }

  handleOnSubmit(event) {
    event && event.preventDefault();

    // Don't allow visitor to send msg if not chatting
    if (this.isOffline()) return;

    const msg = this.refs.input.getRawInput().value;

    // Don't send empty messages
    if (!msg) return;

    this.genericSendMessage(msg);
  }

  genericSendMessage(msg, store = true) {
    if (this.state.toZendesk) {
      // Immediately stop typing
      this.stopTyping.flush();
      zChat.sendChatMsg(msg, (err) => {
        if (err) {
          log('Error occured >>>', err);
          return;
        }
      });

    } else {
      FlexWebChat.Actions.invokeAction(
        "SendMessage",
        { body: msg, channelSid: this.state.channelSid }
      );
    }

    if (store) {
      this.props.dispatch({
        type: 'synthetic',
        detail: {
          type: 'visitor_send_msg',
          msg
        }
      });
    }

    this.refs.input.getRawInput().value = '';
  }

  handleFileUpload(event) {
    event.preventDefault();

    // Don't allow visitor to send file if offline
    if (this.isOffline()) return;

    // Only send the first file dropped on input
    const file = event.dataTransfer.files[0];

    // Generate attachment object for local echo
    const attachment = {
      mime_type: file.type,
      name: file.name,
      size: file.size,
      url: window.URL.createObjectURL(file)
    }

    zChat.sendFile(file, (err) => {
      if (err) {
        log('Error occured >>>', err);
        return;
      }
    });

    this.props.dispatch({
      type: 'synthetic',
      detail: {
        type: 'visitor_send_file',
        attachment
      }
    });
  }

  getVisibilityClass() {
    return this.state.visible ? 'visible' : '';
  }

  minimizeOnClick() {
    this.setVisible(false);
  }

  chatButtonOnClick() {
    this.setVisible(true);
  }

  setVisible(visible) {
    this.setState({
      visible
    });
    set('visible', visible);
  }

  mapToEntities(visitor, agents) {
    const entities = {};
    if (visitor) {
      entities[visitor.nick] = {
        ...visitor,
        type: 'visitor'
      };
    }

    if (agents && Object.keys(agents).length) {
      Object.values(agents).forEach((agent) => {
        if (!agent.nick) return;

        entities[agent.nick] = {
          ...agent,
          type: 'agent'
        };
      });
    }

    if (this.props.data.account_status === 'offline' && !this.props.data.is_chatting) {
      entities['agent:offline'] = {
        type: 'agent',
        nick: 'agent:offline'
      }
    }

    return entities;
  }

  setTheme(theme) {
    this.setState({
      theme
    });
    set('theme', theme);
  }

  onThemeChange(theme) {
    if (theme !== 'docked' && theme !== 'normal') {
      theme = 'docked';
    }

    this.setTheme(theme);
  }

  getTheme() {
    return this.state.theme;
  }

  isOffline() {
    return this.props.data.account_status === 'offline' && !this.props.data.is_chatting;
  }

  render() {
    if (!ACCOUNT_KEY) {
      if (ENV === 'dev') {
        return (
          <div className="warning-container">
            <div className="warning">
              🚨🚨🚨&nbsp;&nbsp;&nbsp;You might have forgotten to configure the widget with your own account key.&nbsp;&nbsp;&nbsp;🚨🚨🚨
              <br/><br/>
              Check the README for more details.
            </div>
          </div>
        );
      }
      else {
        return <div/>;
      }
    }

    const entities = this.mapToEntities(this.props.data.visitor, this.props.data.agents);
    const isOffline = this.isOffline();

    return (
      <div className="index">
        <div className={`widget-container ${this.getTheme()} ${this.getVisibilityClass()}`}>
          <StatusContainer
            accountStatus={this.props.data.account_status}
            minimizeOnClick={this.minimizeOnClick}
          />
          <MessageList
            visible={this.state.visible}
            queuePosition={this.props.data.queue_position}
            isChatting={this.props.data.is_chatting}
            isOffline={isOffline}
            messages={this.props.data && this.props.data.chats.toArray()}
            agents={this.props.data.agents}
            entities={entities}
            lastRatingRequestTimestamp={this.props.data.last_rating_request_timestamp}
            hasRating={this.props.data.has_rating}
          />
          <div className={`spinner-container ${this.state.visible && this.props.data.connection !== 'connected' ? 'visible' : ''}`}>
            <div className="spinner"></div>
          </div>
          <Input
            addClass={this.props.data.is_chatting ? 'visible' : ''}
            ref="input"
            onSubmit={this.handleOnSubmit}
            onChange={this.handleOnChange}
            onFocus={this.inputOnFocus}
            onFileUpload={this.handleFileUpload}
          />
        </div>
        <ChatButton addClass={this.getVisibilityClass()} onClick={this.chatButtonOnClick} />
      </div>
    );
  }
}

App.displayName = 'App';

const mapStateToProps = (state) => {
  return {
    data: state
  }
}

const WrappedApp = connect(
  mapStateToProps
)(App);

export default WrappedApp;
