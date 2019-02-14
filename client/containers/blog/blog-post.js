import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Butter from 'buttercms';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import Colors from '../../styles/colors';

import { SoundwiseHeader } from '../../components/soundwise_header';
import Footer from '../../components/footer';

const butter = Butter('f8b408f99e5169af2c3ccf1f95b4ff7e679b2cbd');

export default class BlogPost extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    };
  }

  componentWillMount() {
    let slug = this.props.match.params.slug;

    butter.post.retrieve(slug).then(resp => {
      this.setState({
        loaded: true,
        post: resp.data.data,
        category: resp.data.data.categories[0].name,
      });
    });
  }

  render() {
    if (this.state.loaded) {
      const post = this.state.post;
      const author = post.author;
      const tags = post.tags.map(tag => tag.name).join(',');
      return (
        <div>
          <Helmet>
            <title>{post.seo_title}</title>
            <meta name="description" content={post.meta_description} />
            <meta name="og:image" content={post.featured_image} />
            <meta property="og:url" content={`https://mysoundwise.com/blog/post/${post.slug}`} />
            <meta property="fb:app_id" content="1726664310980105" />
            <meta property="og:title" content={post.seo_title} />
            <meta property="og:description" content={post.meta_description} />
            <meta property="og:image" content={post.featured_image} />
            <meta name="description" content={post.meta_description} />
            <meta name="keywords" content={tags} />
            <meta name="twitter:title" content={post.seo_title} />
            <meta name="twitter:description" content={post.meta_description} />
            <meta name="twitter:image" content={post.featured_image} />
            <meta name="twitter:card" content={post.featured_image} />
          </Helmet>
          <SoundwiseHeader showIcon={true} />
          <section
            className="padding-70px-tb xs-padding-60px-tb blog-style1 blog-post-style bg-white builder-bg"
            id="blog-section1"
          >
            <div className="row" style={{ paddingLeft: '10%', paddingRight: '10%' }}>
              <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                <img
                  style={{}}
                  className="img100"
                  alt=""
                  src={post.featured_image}
                  data-img-size="(W)800px X (H)507px"
                />
              </div>
            </div>
            <div className="container post-container md-padding-twenty-five-left md-padding-twenty-five-right xs-padding-nine-left xs-padding-nine-right">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                  <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font  tz-text">
                    {post.title}
                  </h2>
                </div>
                {(this.state.category !== 'help-docs' && (
                  <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                    <div
                      className="margin-five-bottom  xs-margin-nine-bottom"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          ...styles.profileImage,
                          backgroundImage: `url(${author.profile_image || ''})`,
                        }}
                      />
                      <div style={{ marginLeft: 15, textAlign: 'left' }}>
                        <div
                          className="text-large text-dark-gray font-weight-800"
                          style={{ fontWeight: 800 }}
                        >{`${author.first_name} ${author.last_name}`}</div>
                        <div className="text-large text-dark-gray ">
                          {moment(post.published).format('MMMM Do YYYY')}
                        </div>
                      </div>
                    </div>
                  </div>
                )) ||
                  null}
                <div
                  className="social social-icon-color text-extra-large sm-text-extra-large  margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text col-md-12 col-sm-12 col-xs-12 text-center "
                  style={{}}
                >
                  <span className="margin-eight-right title-small sm-title-small">Share this:</span>
                  <a
                    target="_blank"
                    href={`http://www.facebook.com/sharer/sharer.php?u=https://mysoundwise.com/blog/post/${
                      post.slug
                    }`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-facebook-f tz-icon-color" />
                  </a>
                  <a
                    target="_blank"
                    href={`https://twitter.com/intent/tweet?text=${
                      post.title
                    }. https://mysoundwise.com/blog/post/${post.slug}`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-twitter tz-icon-color" />
                  </a>
                  <a
                    target="_blank"
                    href={`https://plus.google.com/share?url=https://mysoundwise.com/blog/post/${
                      post.slug
                    }`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-google-plus-g tz-icon-color" />
                  </a>
                  <a
                    target="_blank"
                    href={`https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A//mysoundwise.com/blog/post/${
                      post.slug
                    }&amp;title=${post.seo_title}&amp;source=`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-linkedin-in tz-icon-color" />
                  </a>
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: post.body }} />
              <div className="row">
                <div
                  className="social social-icon-color text-extra-large sm-text-extra-large  margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text col-md-12 col-sm-12 col-xs-12 text-center "
                  style={{}}
                >
                  <span className="margin-eight-right title-small sm-title-small">Share this:</span>
                  <a
                    target="_blank"
                    href={`http://www.facebook.com/sharer/sharer.php?u=https://mysoundwise.com/blog/post/${
                      post.slug
                    }`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-facebook-f tz-icon-color" />
                  </a>
                  <a
                    target="_blank"
                    href={`https://twitter.com/intent/tweet?text=${
                      post.title
                    }. https://mysoundwise.com/blog/post/${post.slug}`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-twitter tz-icon-color" />
                  </a>
                  <a
                    target="_blank"
                    href={`https://plus.google.com/share?url=https://mysoundwise.com/blog/post/${
                      post.slug
                    }`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-google-plus-g tz-icon-color" />
                  </a>
                  <a
                    target="_blank"
                    href={`https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A//mysoundwise.com/blog/post/${
                      post.slug
                    }&amp;title=${post.seo_title}&amp;source=`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-linkedin-in tz-icon-color" />
                  </a>
                </div>
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

const styles = {
  profileImage: {
    width: 60,
    height: 60,
    float: 'left',
    borderRadius: '50%',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
};
