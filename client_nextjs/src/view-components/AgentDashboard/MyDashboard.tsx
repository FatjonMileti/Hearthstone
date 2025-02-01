import { Route, Routes } from 'react-router-dom';
import { AgentDashboard } from './AgentDashboard';
import { Agreement } from '../Agreement/Agreement';
import { AllProperties } from './AllProperties';
import { Matches as SystemMatches } from './Matches';
import { MyAccount } from './pages/MyAccount/MyAccount';
import { AgreementDetails } from '../Agreement/scenes/AgreementDetails';

export const MyDashboard = () => {
  return (
    <Routes>
      <Route path='/' element={<AgentDashboard />} />
      <Route path='/contracts' element={<Agreement />} />
      <Route path='/contracts/:id' element={<AgreementDetails />} />
      <Route path='/agent-property' element={<AllProperties />} />
      <Route path='/agent-matches' element={<SystemMatches />} />
      <Route path='/my-account/*' element={<MyAccount />} />
    </Routes>
  );
};
