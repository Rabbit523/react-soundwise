import React from 'react';

const Media_mention = () => (
  <section id="clients-section4" className="padding-70px-tb bg-white builder-bg clients-section4 xs-padding-40px-tb">
    <div className="container">
      <div className="row">
        { /* section title */ }
        <div className="col-md-12 col-sm-12 col-xs-12 text-center">
          <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
            data-selector=".tz-text" style={ {} }>AS SEEN ON</h2>
        </div>
        { /* end section title */ }
      </div>
      <div className="row">
        { /* clients logo */ }
        <div className="col-md-6 col-sm-6 col-xs-12">
          <div className="client-logo-outer">
            <div className="client-logo-inner"><img src="images/huffington-post-logo.png" data-img-size="(W)800px X (H)500px" alt /></div>
          </div>
        </div>
        <div className="col-md-6 col-sm-6 col-xs-12">
          <div className="client-logo-outer">
            <div className="client-logo-inner"><img src="images/entrepreneur-logo.png" data-img-size="(W)800px X (H)500px" alt /></div>
          </div>
        </div>
        { /* end clients logo */ }
      </div>
    </div>
  </section>
);

export default Media_mention;