import React from 'react';
import Collapsible from 'react-collapsible';
import Colors from '../styles/colors';

class FAQs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 16px' };

    return (
      <section
        className="padding-110px-tb feature-style4 bg-white builder-bg xs-padding-50px-tb border-none bg-gray"
        id="feature-section6"
        style={{}}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12 text-center" style={{}}>
              <div className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                FREQUENTLY ASKED QUESTIONS
              </div>
            </div>
          </div>
          <div className="row" style={{ margin: 'auto' }}>
            <Collapsible
              triggerStyle={{ background: Colors.mainOrange }}
              transitionTime={200}
              trigger="Do my listeners need to download the Soundwise app?"
              easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
            >
              <p style={styles.paragraph}>
                They don’t <i>have to</i>. But keep in mind that tracking of listening records only
                works if a listener is listening to you on Soundwise, either from our mobile app or
                from a computer. They can also receive your text messages, comment on your episodes,
                talk to one another and to you, view your supplementary materials (PDFs, images),
                and buy your paid audio content with one tap on the app.{' '}
              </p>

              <p style={styles.paragraph}>
                If someone signs up to your Soundwise channel but doesn’t have the app installed,
                then you can only reach out to them by email and you won’t be able to know which
                content they have listened to. If you host a podcast on Soundwise, listeners can
                still find and listen to your podcast on any platforms you submit your feed to. But{' '}
                <i>you</i> will be a lot more effective in engaging and converting your listeners if
                they have the Soundwise app.{' '}
              </p>
            </Collapsible>
            <Collapsible
              triggerStyle={{ background: Colors.mainOrange }}
              transitionTime={200}
              trigger="But will I discourage people from subscribing to my podcast if I ask them to download a new app?"
              easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
            >
              <p style={styles.paragraph}>
                No. you won’t. Your listeners can subscribe wherever your podcast is available. But
                remember, if someone subscribes through other platforms, you won’t get much
                information about them. So if you’re going to ask people to subscribe, you might as
                well ask them to do it through Soundwise, so that you can start building an audience
                community that you “own”. You have everything to gain and nothing to lose by asking
                your listeners to download the app.
              </p>
              <p style={styles.paragraph}>
                In fact, we think you should ask proactively and ask often. People who are not
                interested in your materials won’t subscribe anyway. But for those who are your
                ideal audience, you’d want to get hold of them and build a close connection. And
                Soundwise allows you to do that easily.{' '}
              </p>
            </Collapsible>
            <Collapsible
              triggerStyle={{ background: Colors.mainOrange }}
              transitionTime={200}
              trigger="Do I have to host my podcast on Soundwise to take advantage of what you offer?"
              easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
            >
              <p style={styles.paragraph}>
                You don’t have to. We offer unlimited hosting for free, so we can’t see any reason
                why you’re not taking advantage of that. But it’s really up to you. If you have your
                podcast hosted elsewhere, you can simply submit your RSS feed to us when you sign up
                for your Soundwise account. We’ll automatically import and update your podcast data.
                You can, however, add additional episodes or supplementary materials only available
                for your subscribers. We’ve found that to be an effective approach to encourage more
                subscriber signups.
              </p>
            </Collapsible>
            <Collapsible
              triggerStyle={{ background: Colors.mainOrange }}
              transitionTime={200}
              trigger="How do I get more subscribers?"
              easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
            >
              <p style={styles.paragraph}>
                That’s our favorite questions! There’re a lot of things you can do. For example,
                link to your soundcast’s subscription form everywhere you have a web presence— on
                social media, in your email signature, from your own website. Share your episodes
                often (we have{' '}
                <a
                  style={{ color: Colors.mainOrange, target: '_blank' }}
                  href="https://mysoundwise.com/wave_video"
                >
                  an awesome tool
                </a>{' '}
                to help you do that). Add a bit of extra content to your soundcast that only
                subscribers will get, and mention them in your episodes.{' '}
              </p>
              <p style={styles.paragraph}>
                And most importantly, you want to show up and engage with your existing subscribers
                on Soundwise through messages and comments—ask them for content inputs, share useful
                resources, host contests, encourage subscribers to share their experiences and to
                help one another. And then you can leverage the community you have to pitch to
                casual listeners— if they subscribe, they will not only get to interact more with
                you, but also with your cool tribe of like-minded people. For more tips on this,{' '}
                <a
                  style={{ color: Colors.mainOrange, target: '_blank' }}
                  href="https://mysoundwise.com/blog/post/how-to-get-more-subscribers-for-your-podcast-on-soundwise"
                >
                  read this piece
                </a>{' '}
                in our knowledge base.
              </p>
            </Collapsible>
          </div>
        </div>
      </section>
    );
  }
}

const styles = {
  paragraph: {
    fontSize: 17,
    color: 'black',
  },
};

export default FAQs;
