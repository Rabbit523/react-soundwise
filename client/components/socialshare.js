import React from 'react';

const SocialShare = () => (
  <section className="bg-dark-gray builder-bg" id="social-widget5">
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 col-sm-6 text-center bg-sky-blue padding-40px-tb xs-padding-20px-tb tz-background-color">
          <a
            target="_blank"
            href="https://twitter.com/intent/tweet?text=Awesome course from Soundwise. http://mysoundwise.com/"
            className="text-white text-medium"
          >
            <i className="fa fa-twitter icon-medium margin-four-right tz-icon-color vertical-align-sub" />
            <span className="tz-text">Share on Twitter</span>
          </a>
        </div>
        <div className="col-md-3 col-sm-6 text-center padding-40px-tb xs-padding-20px-tb bg-blue tz-background-color">
          <a
            target="_blank"
            href="http://www.facebook.com/sharer/sharer.php?u=http://mysoundwise.com/"
            className="text-white text-medium"
          >
            <i className="fa fa-facebook icon-medium margin-four-right tz-icon-color vertical-align-sub" />
            <span className="tz-text">Share on Facebook</span>
          </a>
        </div>
        <div className="col-md-3 col-sm-6 text-center padding-40px-tb xs-padding-20px-tb bg-orange tz-background-color">
          <a
            target="_blank"
            href="https://plus.google.com/share?url=http://mysoundwise.com/"
            className="text-white text-medium"
          >
            <i className="fa fa-google-plus icon-medium margin-four-right tz-icon-color vertical-align-sub" />
            <span className="tz-text">Share on Google+</span>
          </a>
        </div>
        <div className="col-md-3 col-sm-6 text-center padding-40px-tb xs-padding-20px-tb bg-sky-blue-dark tz-background-color">
          <a
            target="_blank"
            href="https://www.linkedin.com/shareArticle?mini=true&amp;url=http%3A//mysoundwise.com/&amp;title=Soundwise&amp;summary=Learn%20on%20the%20go!&amp;source="
            className="text-white text-medium"
          >
            <i className="fa fa-linkedin icon-medium margin-four-right tz-icon-color vertical-align-sub" />
            <span className="tz-text">Share on Linkedin</span>
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default SocialShare;
