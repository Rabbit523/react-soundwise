import React from 'react';
import { Link } from 'react-router-dom';

const Sample_Courses = () => (
  <section className="bg-white builder-bg  xs-padding-30px-tb" id="portfolios-section11">
    <div className="container-fluid">
      <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 md-padding-50px-tb xs-padding-10px-tb text-center">
        <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-seven-bottom xs-margin-fifteen-bottom tz-text">
          SAMPLE COURSES
        </h2>
      </div>
      <div className="row">
        <div className="work-3col wide gutter">
          <div>
            <div className="overflow-hidden grid-gallery">
              <div className="tab-content">
                <ul className="masonry-items grid work-gallery grid">
                  <li className="html jquery xs-no-padding">
                    <figure>
                      <div className="gallery-img lightbox-gallery">
                        <Link to="/courses">
                          <img
                            src="https://d1jzcuf08rvzm.cloudfront.net/rich_kivel/How+to+Find+the+Right+Business+Model.png"
                            id="tz-bg-143"
                            data-img-size="(W)800px X (H)650px"
                            alt=""
                          />
                        </Link>
                      </div>
                    </figure>
                  </li>
                  <li className="magento wordpress xs-no-padding">
                    <figure>
                      <div className="gallery-img lightbox-gallery">
                        <Link to="/courses">
                          <img
                            src="https://d1jzcuf08rvzm.cloudfront.net/Charlie+Tillet/financial+projections-+what+every+startup+founder+needs+to+know.png"
                            id="tz-bg-144"
                            data-img-size="(W)800px X (H)650px"
                            alt=""
                          />
                        </Link>
                      </div>
                    </figure>
                  </li>
                  <li className="jquery xs-no-padding">
                    <figure>
                      <div className="gallery-img lightbox-gallery">
                        <Link to="/courses">
                          <img
                            src="https://d1jzcuf08rvzm.cloudfront.net/llacey_simmons/all+you+need+to+know+about+teaching+your+child+another+language.png"
                            id="tz-bg-145"
                            data-img-size="(W)800px X (H)650px"
                            alt=""
                          />
                        </Link>
                      </div>
                    </figure>
                  </li>
                  <li className="html magento jquery xs-no-padding">
                    <figure>
                      <div className="gallery-img lightbox-gallery">
                        <Link to="/courses">
                          <img
                            src="https://d1jzcuf08rvzm.cloudfront.net/geoff_woliner/with+Geoff+Woliner.png"
                            id="tz-bg-146"
                            data-img-size="(W)800px X (H)650px"
                            alt=""
                          />
                        </Link>
                      </div>
                    </figure>
                  </li>
                  <li className="html wordpress magento xs-no-padding">
                    <figure>
                      <div className="gallery-img lightbox-gallery">
                        <Link to="/courses">
                          <img
                            src="https://d1jzcuf08rvzm.cloudfront.net/Marsha+Shandur/EASY+NETWORKING.png"
                            id="tz-bg-147"
                            data-img-size="(W)800px X (H)650px"
                            alt=""
                          />
                        </Link>
                      </div>
                    </figure>
                  </li>
                  <li className="wordpress html xs-no-padding">
                    <figure>
                      <div className="gallery-img lightbox-gallery">
                        <Link to="/courses">
                          <img
                            src="https://d1jzcuf08rvzm.cloudfront.net/bob_jones/The+Startup+Product+Launche+Crash+Course.png"
                            id="tz-bg-148"
                            data-img-size="(W)800px X (H)650px"
                            alt=""
                          />
                        </Link>
                      </div>
                    </figure>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Sample_Courses;
