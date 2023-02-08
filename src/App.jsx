import { useCallback, useEffect, useState } from "react";
import SignClient from "@walletconnect/sign-client";
import { Web3Modal } from "@web3modal/standalone";

const projectId = import.meta.env["VITE_WALLET_CONNECT_PROJECT_ID"];

if (!projectId) {
  alert(
    "ERROR: please provide a projectId from https://cloud.walletconnect.com/"
  );
}

const web3Modal = new Web3Modal({
  walletConnectVersion: 2,
  projectId,
});

const useInitWalletConnect = () => {
  const [signClient, setSignClient] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    console.log('initializing SignClient');
    SignClient.init({ projectId })
    .then(setSignClient)
    .catch(setError);
  }, []);

  return [signClient, error];
};

function App() {
  const [signClient, error] = useInitWalletConnect();

  if (error) {
    console.log(error.message);
    alert(error.message);
  }

  const handleConnect = useCallback(async (e) => {
    if (!signClient) {
      alert("signClient is still uninitialized!");
    }

    const namespaces = {
      cosmos: {
        methods: [],
        chains: [e.target.getAttribute('data-namespace')],
        events: [],
      },
    };
    const { uri, approval } = await signClient.connect({
      requiredNamespaces: namespaces,
    });

    if (uri) {
      web3Modal.openModal({ uri, standaloneChains: namespaces.cosmos.chains });
      const session = await approval();
      console.log(session);
      alert('connected! please check your console for session data');
      web3Modal.closeModal();
    }
  }, [signClient]);

  return (
    <div className="App">
      <button disabled={!signClient} onClick={handleConnect} data-namespace="cosmos:cosmoshub-4">
        {!signClient ? "initializing" : "Connect Cosmos Hub"}
      </button>
      <button disabled={!signClient} onClick={handleConnect} data-namespace="cosmos:osmosis-1">
        {!signClient ? "initializing" : "Connect Osmosis"}
      </button>
      <button disabled={!signClient} onClick={handleConnect} data-namespace="cosmos:kava_2222-10">
        {!signClient ? "initializing" : "Connect Kava"}
      </button>
    </div>
  );
}

export default App;
