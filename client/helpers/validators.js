import * as CONFIG from '../config/regexp_config';

export function minLengthValidator(limit, value) {
  return (value.length < limit && `Minimal length is ${limit}`) || '';
}

export function maxLengthValidator(limit, value) {
  return (value.length > limit && `Maximal length is ${limit} characters`) || '';
}

export function minValidator(limit, value) {
  return numberValidator(value) || (+value < limit && `Minimal value is ${limit}`) || '';
}

export function maxValidator(limit, value) {
  return numberValidator(value) || (+value > limit && `Maximal value is ${limit}`) || '';
}

// type validators

export function numberValidator(value) {
  return (isNaN(+value) && 'Must be a number') || '';
}

export function emailValidator(value) {
  const email = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
  return email.test(String(value).toLowerCase());
}
