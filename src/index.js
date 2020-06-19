import React from 'react';
import ReactDOM from 'react-dom';
import Widget from 'components/Widget';
import { Provider } from 'react-redux'
import ChatStore from 'stores/ChatStore';

function initialize(options = {}) {
  const widgetId = options.rootElementId || 'widget';
	let widget = document.getElementById(widgetId);
	if (!widget) {
		widget = document.createElement('div');
		widget.id = widgetId;
		document.body.appendChild(widget);
	}

	// Render the main component into the dom
  ReactDOM.render(
		<Provider store={ChatStore}>
			<Widget options={options} />
		</Provider>,
		widget
	);
}

window.activateZendesk = function(options) {
  if(!window.zendeskWidget) {
    initialize(options);
  } else {
    window.zendeskWidget.toggle();
  }
}
