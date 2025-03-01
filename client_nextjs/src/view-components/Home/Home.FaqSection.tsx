import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';

import { Typography } from '../../components';

import { FaqComponent } from './FaqComponent';

export const FaqSection = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames('faq-section', className)}>
      <Typography variant='body2' className='section-title'>
        Frequently asked questions
      </Typography>
      <div className='section-content'>
        <FaqComponent
          title='Mission Statement on home page'
          description='We are not estate agents we are an innovative AI 
          tech company connecting people and property. Think of us as the
           matchmakers of real estate. Welcome to Hearthstone: the future of property.'
        />
        <FaqComponent
          title='We use Artificial Intelligence?'
          description='Welcome to a new era in real
          estate. Our AI-powered platform dismantles the outdated agency model with the
          finesse of a digital ninja. Using cutting-edge technology, Hearthstone creates a
          seamless, data-driven experience. We connect landlords with prequalified
          tenants and guide sellers to perfect buyers, redefining the industry with
          efficiency, transparency, and a sprinkle of tech magic.'
        />
        <FaqComponent
          title='What is AI?'
          description='AI, or Artificial Intelligence, involves developing
          computer systems capable of performing tasks that usually require human
          intelligence, like learning, understanding language, recognizing patterns, and
          solving problems. At Hearthstone, AI swiftly analyzes vast datasets to ensure precise
          property matches.'
        />
        <FaqComponent
          title='Why AI?'
          description='AI offers unparalleled efficiency, making precise
        predictions, and providing personalized recommendations - eliminating human
        error. This scalability and innovation places Hearthstone at the forefront of modern
        property matching; ensuring a sophisticated, swift, and effortless user
        experience – because who has time for property drama?'
        />
        <FaqComponent
          title='How to get started?'
          descriptionForTenants="Hearthstone’s property search is simple: Input your preferences – location,
          size, budget, etc. Our AI analyzes this data faster than you can say
          'housewarming party' and provides personalized results."
          descriptionForLandlords='Upload your property details, provide two forms of ID for verification
          (we promise not to judge your passport photo), and start matching with top
          tenants. Our advanced AI quickly identifies the best-qualified tenants using our
          unique match rating algorithms.'
        />
        <FaqComponent
          title='What information is needed to find a match?'
          descriptionForTenants='Provide your preferred location, property size, desired amenities, budget, and any other
          specific criteria. The more information you provide, the better our AI can find your dream home.
          Think of it as telling us your property wish list – minus the fairy godmother.'
          descriptionForLandlords='Add your property with details like location, number of bedrooms, and price.
           Upload photos, floorplans, and a photo of your ID and a recent utility bill (because security is no
           joke). Our AI will then match your property with the best tenants, like a property Cupid.'
        />

        <FaqComponent
          title='Can somebody help me with viewing the apartment?'
          description='Hearthstone offers a user-friendly interface to help you navigate the process independently. However,
          our dedicated team of advisors is always available to provide assistance and advice, ensuring a
          seamless experience tailored to your preferences. Whether you need a virtual hand-hold or just some
          friendly advice, we’ve got you covered.'
        />

        <FaqComponent
          title='Why do I need to sign the transaction agreement?'
          description="Signing our transaction agreement unlocks a seamless home rental or sales experience with Hearthstone.
          It's like a friendly handshake that ensures everyone is on the same page. If we find you a tenant,
          there's a fair fee involved. If you're house-hunting, it's free. We're also working on an annual
          subscription with added perks to make your journey even better – think of it as the VIP pass to the
          property world."
        />
        <FaqComponent
          title='How secure is my data?'
          description="Your data's security is our top priority at Hearthstone. We employ robust systems and partner with
          Ankara, a leader in cybersecurity, to ensure your information's confidentiality, integrity, and
          availability. Trust in Hearthstone is backed by industry-leading experts, so you can use our services with
          complete peace of mind. In other words, your data is safer than a squirrel with a nut in a vault."
        />
        <FaqComponent
          title='Is there any assistance over the entire process?'
          description='Hearthstone provides a user-friendly platform designed for easy navigation. While
          you can manage most of the journey independently, our dedicated team of AI
          helpers are always ready to assist and guide you, ensuring a seamless and
          tailored experience. Whether you need a guiding star or just a nudge in the right
          direction, we’re here to help.'
        />
      </div>
    </div>
  );
})`
  &.faq-section {
    position: relative;
    display: grid;
    padding: 48px 36px;
    box-sizing: border-box;
    justify-items: center;
    gap: 48px;
    background-color: #f3f4f5;

    .section-title {
      font-weight: 600;
      line-height: 48px;
    }
    .section-content {
      min-width: 904px;
      display: grid;
      align-items: center;
      gap: 16px;
    }
  }
`;
