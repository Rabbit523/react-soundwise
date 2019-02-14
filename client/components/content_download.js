import React, { Component } from 'react';
import Axios from 'axios';
import 'url-search-params-polyfill'; // URLSearchParams
import Dots from 'react-activity/lib/Dots';

import { inviteListeners } from '../helpers/invite_listeners';
import Colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import { OrangeSubmitButton } from '../components/buttons/buttons';
import { SoundwiseHeader } from '../components/soundwise_header';
import Footer from '../components/footer';
import { TextInputs } from '../helpers/texts';

export default class ContentDownload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      email: '',
      firstName: '',
      lastName: '',
      submitted: false,
      submitting: false,
      content: {},
    };
  }

  componentDidMount() {
    // url format: http://localhost:3000/content_download?image=idea-generation-workbook.png&content=idea-generation-workbook
    const params = new URLSearchParams(this.props.location.search);
    this.setState({
      image: params.get('image'),
      content: TextInputs[params.get('content')],
    });
  }

  componentWillReceiveProps(nextProps) {}

  submit() {
    this.setState({ submitting: true });
    const { firstName, lastName, email, content } = this.state;
    const that = this;
    Axios.post('/api/add_emails', {
      emailListId: 2910467,
      emailAddressArr: [{ firstName, lastName, email }],
    })
      .then(res => {
        that.setState({ submitted: true, submitting: false });
        const subject = `Download link for ${content.title}`;
        const body = `<p>Hi ${firstName},</p><p>Please click <a href="${
          content.link
        }">here</a> to download your ${content.title}. Thanks.</p><p>Folks at Soundwise</p>`;
        inviteListeners([email], subject, body, null, null, null, true, 'support@mysoundwise.com');
      })
      .catch(err => {
        console.log('error: ', err);
        alert(err);
      });
  }

  render() {
    const that = this;
    const { image, content, submitted } = this.state;
    return (
      <div>
        <SoundwiseHeader showIcon={true} />
        <section
          className="padding-40px-tb xs-padding-50px-tb position-relative cover-background tz-builder-bg-image border-none hero-style9"
          id="hero-section11"
          data-img-size="(W)1920px X (H)800px"
          style={{ backgroundColor: '#f8f6f2', height: 800 }}
        >
          <div className="container position-relative" style={{}}>
            <div className="row">
              <div className="col-md-6 col-sm-6 col-xs-12 " style={{}}>
                <div
                  className="col-md-12 center-col"
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <img src={`images/${image}`} style={{ height: '60%', width: '60%' }} />
                </div>
              </div>
              <div
                className="col-md-6 col-sm-6 col-xs-12 builder-bg  xs-height-auto display-table xs-text-center"
                style={{}}
              >
                <div className="display-table-cell-vertical-middle  no-padding-tb xs-no-padding-lr">
                  <div className=" title-small sm-title-small xs-title-small line-height-34 font-weight-600 tz-text margin-twelve-top sm-margin-six-bottom xs-margin-eleven-bottom sm-margin-nine-bottom">
                    {content.subTitle1}
                  </div>
                  <div className="alt-font title-extra-large-3 md-title-extra-large-3 sm-title-extra-large-3 xs-title-extra-large-2 margin-five-top margin-five-bottom width-90 md-width-100 sm-width-100 tz-text">
                    {content.title}
                  </div>
                  <div className=" title-small sm-title-small xs-title-small line-height-34 font-weight-600 tz-text  sm-margin-six-bottom xs-margin-eleven-bottom sm-margin-nine-bottom">
                    {content.subTitle2}
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-10 col-sm-12 col-xs-12 center-col" style={{}}>
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <span style={styles.titleText}>First Name</span>
                  <input
                    type="text"
                    style={styles.inputTitle}
                    placeholder={''}
                    onChange={e => that.setState({ firstName: e.target.value })}
                    value={that.state.firstName}
                  />
                </div>
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <span style={styles.titleText}>Last Name</span>
                  <input
                    type="text"
                    style={styles.inputTitle}
                    placeholder={''}
                    onChange={e => {
                      that.setState({ lastName: e.target.value });
                    }}
                    value={that.state.lastName}
                  />
                </div>
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <span style={styles.titleText}>Email</span>
                  <input
                    type="text"
                    style={styles.inputTitle}
                    placeholder={''}
                    onChange={e => {
                      that.setState({ email: e.target.value });
                    }}
                    value={that.state.email}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              {(!this.state.submitted && !this.state.submitting && (
                <div className="col-md-6 col-sm-6 col-xs-12 center-col" style={{ marginTop: 25 }}>
                  <OrangeSubmitButton
                    label="Submit"
                    onClick={(!submitted && this.submit.bind(this)) || null}
                  />
                </div>
              )) ||
                (this.state.submitted && !this.state.submitting && (
                  <div className="col-md-6 col-sm-6 col-xs-12 center-col" style={{ marginTop: 25 }}>
                    <div className="text-dark-gray tz-text title-large text-center">
                      <span>Thanks! We just sent you an email with the download link 😊</span>
                    </div>
                  </div>
                )) ||
                (!this.state.submitted && this.state.submitting && (
                  <div
                    className="col-md-6 col-sm-6 col-xs-12 center-col text-center"
                    style={{ marginTop: 25 }}
                  >
                    <div className="title-large">Submitting</div>
                    <Dots
                      style={{ marginLeft: 15 }}
                      color={Colors.mainOrange}
                      size={32}
                      speed={1}
                    />
                  </div>
                ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }
}

const styles = {
  titleText: { ...commonStyles.titleText },
  inputTitle: { ...commonStyles.inputTitle },
};
