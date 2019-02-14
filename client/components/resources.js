import React, { Component } from 'react';

class Resources extends Component {
  constructor(props) {
    super(props);

    this.state = {
      course: {
        resources: [
          {
            description: '',
            link: '',
          },
        ],
      },
    };

    this.renderResources = this.renderResources.bind(this);
  }

  renderResources(course) {
    return course.resources.map((resource, i) => {
      return (
        <div className=" " key={i}>
          <h2
            className="text-left width-70 margin-lr-auto font-weight-500  text-large text-dark-gray padding-30px-tb tz-text"
            style={{ display: 'inline-block', paddingLeft: '1em' }}
          >
            {resource.description}
          </h2>
          <span
            className="margin-lr-auto font-weight-500 text-large text-dark-gray padding-30px-tb tz-text"
            style={{ color: '#F76B1C' }}
          >
            {' '}
            (
            <a style={{ textDecoration: 'underline', color: '#F76B1C' }} href={resource.link}>
              {' '}
              Link{' '}
            </a>
            )
          </span>
        </div>
      );
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.course.name.length > 0) {
      this.setState({
        course: nextProps.course,
      });
    }
  }

  render() {
    return (
      <section
        className="padding-40px-tb xs-padding-40px-tb bg-white builder-bg border-none"
        id="title-section1"
      >
        <div className="container">
          <div className="row padding-70px-tb">
            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
              <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                RESOURCES
              </h2>
            </div>
            <div className="row padding-40px-tb">
              <div className="col-md-12 col-sm-12 col-xs-12 container">
                {this.renderResources(this.state.course)}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Resources;
