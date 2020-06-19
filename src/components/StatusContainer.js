'use strict';

import React, { Component } from 'react';

class StatusContainer extends Component {
  constructor(props) {
    super(props);
    this.getStatusText = this.getStatusText.bind(this);
  }

  renderIcon() {
    const isString = typeof (this.props.icon) === 'string';
    return (
      <div className="card-icon">
        {!isString && this.props.icon}
      </div>
    );
  }

  getStatusText(status) {
    switch (status) {
      case 'online': return 'We\'re online!';
      case 'offline': return 'We\'re offline';
      case 'away': return 'We\'re away!';
      default: return 'Connecting...';
    }
  }

  render() {
    return (
      <div className="status-container">
        {this.getStatusText(this.props.accountStatus)}
        {!this.props.hideMinimizeButton && (
          <div>
            <div className="status-button" >
              <div className="status-button-icon minimize" onClick={this.props.minimizeOnClick}>&minus;</div>
              <div className="status-button-icon close" onClick={this.props.closeOnClick}>&times;</div>
            </div>
            <div className="close-button" >
              <div className="close-button-bar" />
            </div>
          </div>)
        }
      </div>
    );
  }
}

StatusContainer.displayName = 'StatusContainer';
StatusContainer.propTypes = {
  accountStatus: React.PropTypes.string,
  minimizeOnClick: React.PropTypes.func
}
export default StatusContainer;
