import { render, screen } from '@testing-library/react';
import ProfileHeader from '../src/components/profile/ProfileHeader';

describe('ProfileHeader', () => {
  it('renders the user name and listener label', () => {
    render(
      <ProfileHeader
        name="Ali"
        isArtist={false}
        isVerified={false}
        subscriptionPlan="Free"
      />,
    );
    expect(screen.getByText('Ali')).toBeInTheDocument();
    expect(screen.getByText('Standard User')).toBeInTheDocument();
  });

  it('renders the free plan badge', () => {
    render(
      <ProfileHeader
        name="Ali"
        isArtist={false}
        isVerified={false}
        subscriptionPlan="Free"
      />,
    );
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('renders the verified artist badge', () => {
    render(
      <ProfileHeader
        name="Artist"
        isArtist
        isVerified
        subscriptionPlan="Premium"
      />,
    );
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });
});
