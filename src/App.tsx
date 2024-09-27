import React from 'react';
import { ConfigProvider } from 'antd';
import UserTable from './components/UserTable';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <UserTable />
    </ConfigProvider>
  );
};

export default App;