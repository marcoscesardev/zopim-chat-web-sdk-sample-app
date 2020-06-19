'use strict';

import React, { Component } from 'react';
import CardContainer from 'components/CardContainer';
import MessageSvg from 'components/MessageSvg';
import ActionButton from 'components/ActionButton';
import { log, urlParam, redactCustom } from 'utils';
import { connect } from 'react-redux'
import { isFunction } from 'lodash';
import zChat from 'vendor/web-sdk';

class PrechatForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sent: false
    };
    this.send = this.send.bind(this);
    this.renderChild = this.renderChild.bind(this);
  }

  send(event) {
    event.preventDefault();

    // Use HTML form validation to validate inputs
    const form = this.refs.form;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const msg = this.refs.message.value;
    // const tncAgreed = true; //this.refs.tncAgreed.value;

    // Don't send empty messages
    if (!msg) return;

    const { transformMessage, redact } = this.props.options || {};
    let transformedMessage = transformMessage && isFunction(transformMessage) ? transformMessage(msg) : msg;
    if(redact) {
      transformedMessage = redactCustom(transformedMessage);
    }

    const userId = this.props.options.userId || urlParam('userid');
    const orderId = localStorage.getItem('orderId');
    const deviceId = localStorage.getItem('deviceId');

    const display_name =  this.props.options.anonymous ? userId || orderId || deviceId || '' : this.refs.name.value || '';

    zChat.setVisitorInfo({
      display_name: display_name,
      email: this.props.options.disableEmail ? '' : this.refs.email.value
    }, (err) => {
      if (err) return;
      zChat.sendChatMsg(transformedMessage, (err) => {
        if (err) log('Error sending message');
      })
    });

    this.props.dispatch({
      type: 'synthetic',
      detail: {
        type: 'visitor_send_msg',
        msg: transformedMessage,
        rawText: msg
      }
    });
  }

  renderChild() {
    const orderId = localStorage.getItem('orderId');
    const deviceId = localStorage.getItem('deviceId');
    const userId = this.props.options.userId || orderId || deviceId || '';
    return (
      <form ref="form" key="not-sent" className="offline-form">
        <div className="content">
          {!this.props.options.anonymous && <div className="section">
            <label className="label">{ userId ? 'User Id' : 'Name' }</label>
            {
             userId ?
             <input ref="name" maxLength="255" value={userId} readOnly={userId}/> :
             <input ref="name" maxLength="255" />
            }
          </div>}
          {!this.props.options.disableEmail && <div className="section">
            <label className="label">Email</label>
            <input ref="email" pattern={`${zChat.EMAIL_REGEX.source}`} />
          </div> }
          <div className="section">
            <label className="label">Message</label>
            <textarea required ref="message" />
          </div>
          <div className="section">
            <div className="tnc">
             <input required ref="tncAgreed" name="tnc" type="checkbox" value={true} />
             <p className="tnc-message">Demi kenyamanan dan privasi Anda, interaksi ini akan kami jadikan referensi informasi data pelanggan kami. Untuk info lebih lengkap mengenai privasi pelanggan Live.On, kunjungi <a href="https://www.liveon.id/privacy-policy">kebijakan-privasi</a>. Pilih Lanjut setelah Anda membaca dan menyetujui syarat dan ketentuan mengenai privasi pelanggan Live.On</p>
            </div>
          </div>
        </div>
        <div className="button-container">
          <ActionButton
            addClass="button-send"
            label="Send"
            onClick={this.send}
          />
        </div>
      </form>
    );
  }

  render() {
    return (
      <CardContainer title="Live.On" addClass="offline-card" contentAddClass={this.state.sent ? 'sent' : ''} icon={ <MessageSvg /> }>
        {this.renderChild()}
      </CardContainer>
    );
  }
}


PrechatForm.displayName = 'PrechatForm';
PrechatForm.propTypes = {
  onClick: React.PropTypes.func,
  addClass: React.PropTypes.string
};
PrechatForm.defaultProps = {
  options: {}
};

export default connect()(PrechatForm);
