import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Butter from 'buttercms';
import moment from 'moment';
import { Helmet } from 'react-helmet';

import { SoundwiseHeader2 } from '../../components/soundwise_header2';
import Footer from '../../components/footer';

const butter = Butter('f8b408f99e5169af2c3ccf1f95b4ff7e679b2cbd');

export default class IGPList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      posts: null,
      resp: null,
    };
  }

  fetchPosts(page) {
    butter.post.list({ category_slug: 'igp', page: 1, page_size: 60 }).then(resp => {
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
          <Helmet>
            <title>{'Inner Game of Podcasting | Soundwise'}</title>
            <meta property="og:url" content="https://mysoundwise.com/igp" />
            <meta property="fb:app_id" content="1726664310980105" />
            <meta property="og:title" content="Inner Game of Podcasting | Soundwise" />
            <meta
              property="og:description"
              content={'Celebrating extraordinary audio creators and their stories.'}
            />
            <meta property="og:image" content="https://mysoundwise.com/images/soundwise-home.png" />
            <meta
              name="description"
              content={'Celebrating extraordinary audio creators and their stories.'}
            />
            <meta
              name="keywords"
              content="soundwise, training, online education, education software, subscription, soundwise inc, real estate, real estate broker, real estate agents, real estate brokerage, real estate training, audio publishing, content management system, audio, mobile application, learning, online learning, online course, podcast, mobile app"
            />
            <meta name="twitter:title" content="Inner Game of Podcasting | Soundwise" />
            <meta
              name="twitter:description"
              content="Celebrating extraordinary audio creators and their stories."
            />
            <meta
              name="twitter:image"
              content="https://mysoundwise.com/images/soundwise-home.png"
            />
            <meta name="twitter:card" content="https://mysoundwise.com/images/soundwise-home.png" />
          </Helmet>
          <SoundwiseHeader2 />
          <section
            className="padding-110px-tb xs-padding-60px-tb blog-style1 bg-white builder-bg"
            id="blog-section1"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                  <h1 className="title-extra-large-2 sm-title-extra-large xs-title-large text-dark-gray font-weight-700 alt-font margin-five-bottom  xs-margin-nine-bottom tz-text">
                    THE INNER GAME OF PODCASTING
                  </h1>
                  <h2
                    style={{ fontStyle: 'italic' }}
                    className="title-medium sm-title-small xs-title-small text-dark-gray alt-font margin-thirteen-bottom  xs-margin-nineteen-bottom tz-text"
                  >
                    Celebrating extraordinary audio creators and their stories
                  </h2>
                </div>
              </div>
              <div className="row">
                {this.state.posts.map(post => {
                  return (
                    <div
                      key={post.slug}
                      className="col-md-4 col-sm-4 col-xs-12 margin-seven-bottom xs-margin-nineteen-bottom "
                    >
                      <Link to={`/igp/${post.slug}`}>
                        <div className="blog-post">
                          <div className="blog-image">
                            <img
                              className="img100"
                              alt=""
                              src={post.featured_image}
                              data-img-size="(W)800px X (H)507px"
                            />
                          </div>
                          <div style={{ padding: 20 }} className=" bg-gray tz-background-color">
                            <div className="text-extra-large sm-text-large xs-text-large text-dark-gray tz-text">
                              {post.summary.length > 300
                                ? `${post.summary.slice(0, 300)}...`
                                : post.summary}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
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
          <SoundwiseHeader2 showIcon={true} blog={true} />
          <div />
          <div style={{ bottom: 0, width: '100%', position: 'absolute' }}>
            <Footer />
          </div>
        </div>
      );
    }
  }
}
