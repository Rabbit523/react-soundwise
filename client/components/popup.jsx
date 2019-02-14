import React from 'react';
import Popup_form from './popup_form';

const Popup = () => (
    <section id="hero-section13" className="no-padding  bg-orange border-none">
        <div className='md-pull-right'
            style={{float: 'right'}}>
          <i className="material-icons text-white"
             style={{fontSize: '42px'}}
            >close</i>
        </div>
        <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
                <div
                    className="col-md-12 col-sm-12 col-xs-12 display-table text-left xs-margin-nineteen-bottom xs-text-center"
                    style={{height: '500px'}}
                >
                    <div className="display-table-cell-vertical-middle xs-padding-nineteen-top text-center">
                        <h1 className="sm-title-extra-large alt-font xs-title-extra-large letter-spacing-minus-1 title-extra-large-7 line-height-85 text-white tz-text margin-eight-bottom">
                            HEY! CAN WE SEND YOU FREE STUFF?
                        </h1>
                        <div
                            className="text-white title-medium xs-title-small margin-twelve-bottom sm-margin-nine-bottom tz-text text-center width-80 sm-width-100"
                            style={{display: 'flexbox', alignItem: 'center'}}
                        >
                            <p>Be the first to know when Soundwise is released and get one audio course for FREE.</p>
                        </div>
                        <div className="col-md-12 col-sm-12 contact-form-style2 no-padding text-center">
                            <div className="slider-button">
                                <button
                                    type="submit"
                                    className="contact-submit tz-text btn btn-large border-radius-4 propClone bg-dark-gray text-white xs-width-100 xs-margin-thirteen-bottom"
                                >
                                    YES, OF COURSE!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default Popup;
