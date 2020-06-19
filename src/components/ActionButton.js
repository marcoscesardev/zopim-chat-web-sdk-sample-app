'use strict';

import React, { Component } from 'react';

class ActionButton extends Component {
  render() {
    return (
      <button
        disabled={this.props.disabled}
        className={`action-button ${this.props.addClass}`}
        onClick={this.props.onClick}>
        {this.props.label}
      </button>
    );
  }
}


ActionButton.displayName = 'ActionButton';
ActionButton.propTypes = {
  onClick: React.PropTypes.func,
  label: React.PropTypes.string,
  addClass: React.PropTypes.string,
  disabled: React.PropTypes.bool
};

export default ActionButton;
