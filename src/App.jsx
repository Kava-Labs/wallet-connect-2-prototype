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
  const [topic, setTopic] = useState('')
  const [addr, setAddr] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
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
        methods: ["cosmos_getAccounts", "cosmos_signDirect", "cosmos_signAmino"],
        chains: [e.target.getAttribute('data-namespace')],
        events: ["accountsChanged"],
      },
    };
    const { uri, approval } = await signClient.connect({
      requiredNamespaces: namespaces,
    });

    if (uri) {
      web3Modal.openModal({ uri, standaloneChains: namespaces.cosmos.chains });
      const session = await approval();
      console.log(session);
      setSelectedChain(e.target.getAttribute('data-namespace'));
      setAddr(session.namespaces.cosmos.accounts[0].replace(`${e.target.getAttribute('data-namespace')}:`, ''));
      setTopic(session.topic);
      web3Modal.closeModal();
    }
  }, [signClient]);


  const signTx = async () => {
    try {
      const res = await signClient.request({
        topic: topic,
        chainId: selectedChain,
        request: {
          "jsonrpc": "2.0",
          "method": "cosmos_signAmino",
          "params": {
            "signerAddress": addr,
            "signDoc": {
              "chain_id": selectedChain.replace("cosmos:", ''),
              "account_number": "7",
              "sequence": "54",
              "memo": "hello, world",
              "msgs": [],
              "fee": { "amount": [], "gas": "23" }
            }
          }
        },
      })
      console.log(res);

      alert("Success: You just signed a transaction check the console for details!")
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <h3>
        {"Address: " + addr}
      </h3>

      <h3>
        {"Topic: " + topic}
      </h3>

      <div>
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

      {
        addr && topic && <button onClick={signTx}>
          Sign A Tx
        </button>
      }

    </div>
  );
}

export default App;
