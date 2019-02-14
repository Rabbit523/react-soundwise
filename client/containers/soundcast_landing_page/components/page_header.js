import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const PageHeader = props => (
  <header className="leadgen-agency-1" id="header-section1">
    <nav className="navbar bg-white tz-header-bg no-margin alt-font shrink-header light-header">
      <div className="container navigation-menu">
        <div className="row">
          <div className="col-md-3 col-sm-0 col-xs-0">
            <Link to={props.soundcastID ? `/soundcasts/${props.soundcastID}` : '/'}>
              <img
                alt="Soundwise Logo"
                src="../../images/soundwiselogo.svg"
                data-img-size="(W)163px X (H)39px"
              />
            </Link>
          </div>
          <div className="col-md-9 col-sm-12 col-xs-12 position-inherit">
            {/*menu button for md, sm, xs*/}
            <button
              data-target="#bs-example-navbar-collapse-1"
              data-toggle="collapse"
              className="navbar-toggle collapsed"
              type="button"
            >
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar" />
              <span className="icon-bar" />
              <span className="icon-bar" />
            </button>
            {/*inline menu for lg*/}
            <div
              id="bs-example-navbar-collapse-1"
              className="collapse navbar-collapse pull-right font-weight-500"
            />
          </div>
        </div>
      </div>
    </nav>
  </header>
);

export default PageHeader;
