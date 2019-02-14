import React, { Component } from 'react';
import Colors from '../../styles/colors';
import PropTypes from 'prop-types';

const props = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  styles: PropTypes.object,
};

export const OrangeSubmitButton = props => {
  const { id, label, onClick, styles } = props;
  return (
    <div
      id={id}
      style={{ ..._styles.orangeSubmitButton, ...(styles || {}) }}
      onClick={onClick}
      className="text-center"
    >
      {label}
    </div>
  );
};
OrangeSubmitButton.propTypes = props;

export const TransparentShortSubmitButton = props => {
  const { label, onClick, styles } = props;
  return (
    <div
      style={{
        ..._styles.orangeSubmitButton,
        ..._styles.transparentShortSubmitButton,
        ...(styles || {}),
      }}
      onClick={onClick}
      className="text-center"
    >
      {label}
    </div>
  );
};
TransparentShortSubmitButton.propTypes = props;

const _styles = {
  orangeSubmitButton: {
    width: 229,
    height: 37,
    backgroundColor: Colors.mainOrange,
    borderRadius: 5,
    overflow: 'hidden',
    margin: '40px auto',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    wordSpacing: 5,
    color: Colors.mainWhite,
    paddingTop: 6,
    paddingRight: 20,
    paddingBottom: 6,
    paddingLeft: 20,
    borderColor: Colors.mainOrange,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
  },
  transparentShortSubmitButton: {
    backgroundColor: 'transparent',
    width: 97,
    color: Colors.darkGrey,
    borderColor: Colors.darkGrey,
  },
};
