var app = require('../server');
var moment = require('moment');

const Transaction = app.models.Transaction;
const Publisher = app.models.Publisher;
const ListeningSession = app.models.ListeningSession;

const _transactions = [
  // this should be paid
  {
    transactionId: moment().format('x') + 't', //'charge' or 'refund' id from stripe
    invoiceId: 'invoiceId1', //only present if the charge is associated with a subscription invoice
    chargeId: 'ch_123123',
    type: 'charge', // 'charge' or 'refund'
    amount: 2,
    date: moment()
      .subtract(40, 'days')
      .format('YYYY-MM-DD'),
    publisherId: '1503002103690p',
    soundcastId: '1503691618714s',
    customer: 'customer1', // listener's stripe id
    paymentId: 'monthly payment plan 2', // id for the payment plan, only present if it's a subscription
    createdAt: moment()
      .utc()
      .format(),
    updatedAt: moment()
      .utc()
      .format(),
  },
  // this is old
  {
    transactionId: moment().format('x') + 't', //'charge' or 'refund' id from stripe
    invoiceId: 'invoiceId2', //only present if the charge is associated with a subscription invoice
    chargeId: 'ch_123124',
    type: 'charge', // 'charge' or 'refund'
    amount: 4,
    date: moment()
      .subtract(40, 'days')
      .format('YYYY-MM-DD'),
    publisherId: '1503002103690p',
    soundcastId: '1503691618714s',
    customer: 'customer1', // listener's stripe id
    paymentId: 'monthly payment plan 2', // id for the payment plan, only present if it's a subscription
    createdAt: moment()
      .utc()
      .format(),
    updatedAt: moment()
      .utc()
      .format(),
  },
  // this shouldn't be paid because of refund
  {
    transactionId: moment().format('x') + '4' + 't', //'charge' or 'refund' id from stripe
    invoiceId: 'invoiceId3', //only present if the charge is associated with a subscription invoice
    chargeId: 'ch_123125',
    type: 'charge', // 'charge' or 'refund'
    amount: 3,
    date: moment()
      .subtract(40, 'days')
      .format('YYYY-MM-DD'),
    publisherId: '1503002103690p',
    soundcastId: '1505855025645s',
    customer: 'customer2', // listener's stripe id
    paymentId: 'monthly payment plan 3', // id for the payment plan, only present if it's a subscription
    createdAt: moment()
      .utc()
      .format(),
    updatedAt: moment()
      .utc()
      .format(),
  },
  // this is refund
  {
    transactionId: moment().format('x') + '5' + 't', //'charge' or 'refund' id from stripe
    invoiceId: 'invoiceId4', //only present if the charge is associated with a subscription invoice
    chargeId: 'ch_123126',
    type: 'refund', // 'charge' or 'refund'
    amount: 3,
    date: moment()
      .subtract(40, 'days')
      .format('YYYY-MM-DD'),
    publisherId: '1503002103690p',
    soundcastId: '1505855025645s',
    customer: 'customer2', // listener's stripe id
    paymentId: 'monthly payment plan 3', // id for the payment plan, only present if it's a subscription
    createdAt: moment()
      .utc()
      .format(),
    updatedAt: moment()
      .utc()
      .format(),
  },
];

_transactions.map(transaction => {
  Transaction.create(transaction)
    .then(res => console.log('success save transaction'))
    .catch(err => console.log('ERROR save transaction: ', err));
});

const _listeningSessions = [
  {
    publisherId: '1508293592360p',
    date: '2018-05-08',
    startPosition: 0,
    endPosition: 698,
    sessionDuration: 699,
    percentCompleted: 100,
    createdAt: '2018-05-09T00:31:45.000Z',
    updatedAt: '2018-05-09T00:31:15.608Z',
    soundcastId: '1512247726161s',
    episodeId: '1512249547312e',
    userId: '0ynaNpeWVseNx9fOdfDUlPzu5hh2',
  },
  {
    publisherId: '1508293592360p',
    date: '2018-05-08',
    startPosition: 0,
    endPosition: 698,
    sessionDuration: 699,
    percentCompleted: 100,
    createdAt: '2018-05-09T00:31:45.000Z',
    updatedAt: '2018-05-09T00:31:15.648Z',
    soundcastId: '1512247726161s',
    episodeId: '1512249547312e',
    userId: '0ynaNpeWVseNx9fOdfDUlPzu5hh2',
  },
  {
    publisherId: '1508293592360p',
    date: '2018-05-08',
    startPosition: 0,
    endPosition: 343,
    sessionDuration: 343,
    percentCompleted: 22,
    createdAt: '2018-05-09T01:20:20.000Z',
    updatedAt: '2018-05-09T01:19:52.306Z',
    soundcastId: '1508293913676s',
    episodeId: '1524930324976e',
    userId: 'guest_listening',
  },
  {
    publisherId: '1508293592360p',
    date: '2018-05-08',
    startPosition: 0,
    endPosition: 1281,
    sessionDuration: 1281,
    percentCompleted: 100,
    createdAt: '2018-05-09T00:53:47.000Z',
    updatedAt: '2018-05-09T07:04:06.652Z',
    soundcastId: '1508293913676s',
    episodeId: '1520794785932e',
    userId: 'Mq4FHCpWLqg7iRZdMpMTNMjfoCw1',
  },
  {
    publisherId: '1508293592360p',
    date: '2018-05-08',
    startPosition: 0,
    endPosition: 1281,
    sessionDuration: 1281,
    percentCompleted: 100,
    createdAt: '2018-05-09T00:53:47.000Z',
    updatedAt: '2018-05-09T07:04:06.914Z',
    soundcastId: '1508293913676s',
    episodeId: '1520794785932e',
    userId: 'Mq4FHCpWLqg7iRZdMpMTNMjfoCw1',
  },
  {
    publisherId: '1508293592360p',
    date: '2018-05-09',
    startPosition: 0,
    endPosition: 1282,
    sessionDuration: 1282,
    percentCompleted: 100,
    createdAt: '2018-05-09T07:31:29.000Z',
    updatedAt: '2018-05-09T07:30:59.228Z',
    soundcastId: '1508293913676s',
    episodeId: '1520794785932e',
    userId: 'Mq4FHCpWLqg7iRZdMpMTNMjfoCw1',
  },
  {
    publisherId: '1508293592360p',
    date: '2018-05-09T10:12:13Z',
    startPosition: 0,
    endPosition: 0,
    sessionDuration: 1276,
    percentCompleted: 100,
    createdAt: '2018-05-09T10:12:13.000Z',
    updatedAt: '2018-05-09T10:12:13.000Z',
    soundcastId: '1508293913676s',
    episodeId: '1525652723511e',
    userId: 'EdRpXudh0hQvTQdpRCHlxxJbIQv2',
  },
  {
    publisherId: '1513445197869p',
    date: '2018-05-09T14:00:51Z',
    startPosition: 0,
    endPosition: 0,
    sessionDuration: 972,
    percentCompleted: 100,
    createdAt: '2018-05-09T14:00:51.000Z',
    updatedAt: '2018-05-09T14:00:51.000Z',
    soundcastId: '1513445399143s',
    episodeId: '1518802099821e',
    userId: 'xP7WlSctXlXsCXQ2L4NMxx163yq2',
  },
  {
    publisherId: '1508293592360p',
    date: '2018-05-09',
    startPosition: 0,
    endPosition: 1545,
    sessionDuration: 1545,
    percentCompleted: 100,
    createdAt: '2018-05-09T15:01:05.000Z',
    updatedAt: '2018-05-09T15:00:33.992Z',
    soundcastId: '1508293913676s',
    episodeId: '1524930324976e',
    userId: 'guest_listening',
  },
  {
    publisherId: '1508293592360p',
    date: '2018-05-09',
    startPosition: 0,
    endPosition: 1545,
    sessionDuration: 1545,
    percentCompleted: 100,
    createdAt: '2018-05-09T15:01:05.000Z',
    updatedAt: '2018-05-09T15:00:34.023Z',
    soundcastId: '1508293913676s',
    episodeId: '1524930324976e',
    userId: 'guest_listening',
  },
];

_listeningSessions.map(listeningSession => {
  ListeningSession.create(listeningSession)
    .then(res => console.log('success save listening session'))
    .catch(err => console.log('ERROR save listening session: ', err));
});
