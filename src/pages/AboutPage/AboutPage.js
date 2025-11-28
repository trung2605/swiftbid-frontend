import React from 'react';
import About from '../../components/About/About';
import './AboutPage.scss';
import TeamMemberImage from '../../assets/images/memberAvatar.png';

/**
 * AboutPage Component
 * Full page dedicated to About information
 */
const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About SwiftBid</h1>
        <p>Learn more about our mission and values</p>
      </div>

      <About />

      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img src={TeamMemberImage} alt="Team Member" />
              </div>
              <h3 className="member-name">John Doe</h3>
              <p className="member-role">CEO & Founder</p>
            </div>

            <div className="team-member">
              <div className="member-image">
                <img src={TeamMemberImage} alt="Team Member" />
              </div>
              <h3 className="member-name">Jane Smith</h3>
              <p className="member-role">CTO</p>
            </div>

            <div className="team-member">
              <div className="member-image">
                <img src={TeamMemberImage} alt="Team Member" />
              </div>
              <h3 className="member-name">Mike Johnson</h3>
              <p className="member-role">Head of Operations</p>
            </div>

            <div className="team-member">
              <div className="member-image">
                <img src={TeamMemberImage} alt="Team Member" />
              </div>
              <h3 className="member-name">Sarah Williams</h3>
              <p className="member-role">Lead Designer</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
