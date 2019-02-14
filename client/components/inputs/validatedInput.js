import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Colors from '../../styles/colors';

export default class ValidatedInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isTouched: false,
    };
  }

  onChange(e) {
    this.props.onChange(e);
    if (!this.state.isTouched) {
      this.setState({ isTouched: true });
    }
  }

  render() {
    const {
      validators,
      styles,
      type,
      placeholder,
      onChange,
      value,
      wrapperStyles,
      errorStyles,
    } = this.props;
    const { isTouched } = this.state;
    const _validateResults = [];
    validators.map(validator => {
      const _validateRes = validator(value);
      if (_validateRes) {
        _validateResults.push(_validateRes);
      }
    });

    return (
      <div style={wrapperStyles}>
        <input
          type={type}
          style={{
            ...styles,
            ...((_validateResults.length && isTouched && { borderColor: Colors.mainRed }) || {}),
          }}
          placeholder={placeholder}
          onChange={this.onChange.bind(this)}
          onKeyPress={this.props.onKeyPress}
          value={value}
        />
        {(isTouched &&
          _validateResults.map((error, i) => {
            return (
              <div key={i} style={{ ..._styles.errorText, ...(errorStyles || {}) }}>
                {error}
              </div>
            );
          })) ||
          null}
      </div>
    );
  }
}

ValidatedInput.propTypes = {
  validators: PropTypes.array,
  styles: PropTypes.object,
  wrapperStyles: PropTypes.object,
  errorStyles: PropTypes.object,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

const _styles = {
  errorText: {
    color: Colors.mainRed,
  },
};
