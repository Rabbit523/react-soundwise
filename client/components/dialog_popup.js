import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DIALOG_CONFIG from '../config/dialog_config';

export default class DialogPopup extends Component {
  render() {
    const { dialogType, buttonActions, isShown, onRequestClose } = this.props;
    const settings = DIALOG_CONFIG[dialogType];

    return (
      <div className="col-md-12 col-sm-12 col-xs-12">
        <Dialog
          title={settings.title}
          actions={settings.actions.map((button, i) => (
            <FlatButton
              key={i}
              label={button.label}
              primary={button.primary}
              keyboardFocused={button.keyboardFocused}
              onTouchTap={buttonActions[i]}
            />
          ))}
          modal={false}
          open={isShown}
          onRequestClose={onRequestClose}
        >
          {settings.message}
        </Dialog>
      </div>
    );
  }
}

// DialogPopup.propTypes = {
//     dialogType: PropTypes.string,
//     buttonActions: PropTypes.array,
//     isShown: PropTypes.bool,
//     onRequestClose: PropTypes.func,
// };
