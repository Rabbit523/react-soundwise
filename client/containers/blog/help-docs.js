import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Butter from 'buttercms';
import moment from 'moment';

import { SoundwiseHeader } from '../../components/soundwise_header';
import Footer from '../../components/footer';

const butter = Butter('f8b408f99e5169af2c3ccf1f95b4ff7e679b2cbd');

export default class HelpDocs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      resp: null,
    };
  }

  fetchPosts(page) {
    butter.post.list({ category_slug: 'help-docs' }).then(resp => {
      const posts = resp.data.data;
      this.setState({
        loaded: true,
        posts: posts,
        resp: resp.data,
      });
    });
  }

  componentWillMount() {
    let page =
      this.props.match.params && this.props.match.params.page ? this.props.match.params.page : 1;
    // console.log('this.props.params.page: ', this.props.params.page);
    this.fetchPosts(page);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ loaded: false });
    let page =
      nextProps.match.params && nextProps.match.params.page ? nextProps.match.params.page : 1;

    this.fetchPosts(page);
  }

  render() {
    if (this.state.loaded) {
      const { next_page, previous_page } = this.state.resp.meta;
      return (
        <div>
          <SoundwiseHeader showIcon={true} />
          <section
            className="padding-110px-tb xs-padding-60px-tb blog-style1 bg-white builder-bg"
            id="blog-section1"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                  <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-thirteen-bottom  xs-margin-nineteen-bottom tz-text">
                    KNOWLEDGE BASE
                  </h2>
                </div>
              </div>
              <div className="row">
                {this.state.posts.map(post => {
                  return (
                    <div
                      key={post.slug}
                      className="center-col col-md-8 col-sm-6 col-xs-12 margin-seven-bottom xs-margin-nineteen-bottom "
                    >
                      <Link to={`/blog/post/${post.slug}`}>
                        <div className="blog-post">
                          <div className="post-details bg-gray tz-background-color">
                            <div className="tz-text text-dark-gray  section-title-small sm-section-title-small xs-section-title-small font-weight-600 margin-five-bottom display-inline-block md-margin-five-bottom">
                              {post.title}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
              <br />
              <div>
                {(previous_page && <Link to={`/p/${previous_page}`}>Prev</Link>) || null}
                {(next_page && <Link to={`/p/${next_page}`}>Next</Link>) || null}
              </div>
            </div>
          </section>
          <div style={{ bottom: 0, width: '100%', position: 'static' }}>
            <Footer showPricing={true} />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <SoundwiseHeader showIcon={true} blog={true} />
          <div />
          <div style={{ bottom: 0, width: '100%', position: 'absolute' }}>
            <Footer />
          </div>
        </div>
      );
    }
  }
}
