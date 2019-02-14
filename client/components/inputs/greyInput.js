import React from 'react';
import PropTypes from 'prop-types';

import Colors from '../../styles/colors';
import commonStyles from '../../styles/commonStyles';
import ValidatedInput from '../../components/inputs/validatedInput';

export const GreyInput = props => {
  const {
    validators,
    styles,
    type,
    placeholder,
    onChange,
    onKeyPress,
    value,
    wrapperStyles,
  } = props;

  return (
    <ValidatedInput
      type={type || 'text'}
      styles={{ ..._styles.input, ...styles }}
      wrapperStyles={wrapperStyles}
      placeholder={placeholder}
      onChange={onChange}
      onKeyPress={onKeyPress}
      value={value}
      validators={validators}
      errorStyles={_styles.errorStyles}
    />
  );
};

GreyInput.propTypes = {
  validators: PropTypes.array,
  styles: PropTypes.object,
  wrapperStyles: PropTypes.object,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  value: PropTypes.string,
};

const _styles = {
  input: { ...commonStyles.input },
  errorStyles: {
    fontSize: 11,
    position: 'relative',
    bottom: 20,
  },
};
