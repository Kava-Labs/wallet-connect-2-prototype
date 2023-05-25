import { WalletProvider } from './provider/WalletProvider';
import { Example } from './Example';

const App2 = () => (
  <WalletProvider>
    <Example />
  </WalletProvider>
);

export default App2;
