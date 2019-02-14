import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Butter from 'buttercms';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import Colors from '../../styles/colors';

import { SoundwiseHeader } from '../../components/soundwise_header';
import Footer from '../../components/footer';

const butter = Butter('f8b408f99e5169af2c3ccf1f95b4ff7e679b2cbd');

export default class IGPPost extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loadedPosts: false,
      post: '',
    };
  }

  componentDidMount() {
    let slug = this.props.match.params.slug;

    butter.post.retrieve(slug).then(resp => {
      this.setState({
        loaded: true,
        post: resp.data.data,
        category: resp.data.data.categories[0].name,
      });
    });
    this.fetchPosts();
  }

  componentWillReceiveProps(nextProps) {
    let slug = nextProps.match.params.slug;

    butter.post.retrieve(slug).then(resp => {
      this.setState({
        loaded: true,
        post: resp.data.data,
        category: resp.data.data.categories[0].name,
      });
    });
    this.fetchPosts();
  }

  fetchPosts(page) {
    butter.post.list({ category_slug: 'igp', page: 1, page_size: 60 }).then(resp => {
      const posts = resp.data.data;
      const currentPost = this.state.post;
      const filteredPosts = [];
      posts.forEach(post => {
        if (post.slug !== currentPost.slug) {
          filteredPosts.push(post);
        }
      });
      this.setState({
        loadedPosts: true,
        posts: filteredPosts,
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
          <SoundwiseHeader showIcon={true} blog={true} />
          <section
            className="padding-70px-tb xs-padding-60px-tb blog-style2 blog-post-style bg-white builder-bg"
            id="blog-section1"
          >
            <div className="container post-container md-padding-twenty-five-left md-padding-twenty-five-right xs-padding-nine-left xs-padding-nine-right">
              <div className="row" />
              <div dangerouslySetInnerHTML={{ __html: post.body }} />
              <div className="row">
                <div
                  className="social social-icon-color text-extra-large sm-text-extra-large  margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text col-md-12 col-sm-12 col-xs-12 text-center "
                  style={{}}
                >
                  <span className="margin-eight-right title-small sm-title-small">Share this:</span>
                  <a
                    target="_blank"
                    href={`http://www.facebook.com/sharer/sharer.php?u=https://mysoundwise.com/igp/${
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
                    }. https://mysoundwise.com/igp/${post.slug}`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-twitter tz-icon-color" />
                  </a>
                  <a
                    target="_blank"
                    href={`https://plus.google.com/share?url=https://mysoundwise.com/igp/${
                      post.slug
                    }`}
                    className="margin-eight-right"
                  >
                    <i className="icon-large sm-icon-extra-small fab fa-google-plus-g tz-icon-color" />
                  </a>
                  <a
                    target="_blank"
                    href={`https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A//mysoundwise.com/igp/${
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
          {(this.state.loadedPosts && (
            <section className="padding-30px-tb xs-padding-60px-tb  bg-white builder-bg" id="">
              <div className="container">
                <div className="row">
                  <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                    <h3
                      style={{ marginBottom: 0 }}
                      className="title-small sm-title-small xs-title-small text-dark-gray font-weight-700 alt-font tz-text"
                    >
                      THE INNER GAME OF PODCASTING
                    </h3>
                    <h2
                      style={{ marginTop: 0 }}
                      className="title-extra-large-2 sm-title-large xs-title-large text-dark-gray font-weight-700 alt-font margin-five-bottom  xs-margin-nine-bottom tz-text"
                    >
                      MORE STORIES
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
          )) ||
            null}
          <div style={{ bottom: 0, width: '100%', position: 'static' }}>
            <Footer showPricing={true} />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <SoundwiseHeader showIcon={true} blog={true} />
          <div>Loading...</div>
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
