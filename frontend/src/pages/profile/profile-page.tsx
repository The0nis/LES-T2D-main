import AddressInfoBox from '@/components/profile/address-information';
import PasswordInfoBox from '@/components/profile/password-info-box';
import PersonalInfoBox from '@/components/profile/peronal-info-box';
import ProfileReusableLayout from '@/layout/ProfileReusableLayout';

export default function ProfilePage() {
  return (
    <ProfileReusableLayout>
      <>
        <PersonalInfoBox />
        <AddressInfoBox />
        <PasswordInfoBox />
      </>
    </ProfileReusableLayout>
  );
}
