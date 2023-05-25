import { useWalletProvider } from './provider/WalletProvider';



export const Example = () => {
    const { wallet, connectWallet, signTx } = useWalletProvider();
    const { address, chainId, sessionTopic, pairingTopic } = wallet;


    return <>
        <h3 style={{ textAlign: "center" }}> Wallet Connect 2</h3>
        <h5 style={{ textAlign: "center" }}> Address: {address} </h5>
        <h5 style={{ textAlign: "center" }}> ChainId: {chainId} </h5>
        <h5 style={{ textAlign: "center" }}> SessionTopic: {sessionTopic} </h5>
        <h5 style={{ textAlign: "center" }}> PairingTopic: {pairingTopic} </h5>

        <button onClick={connectWallet}>
            connect
        </button>
        <button onClick={signTx}>
            Sign Tx
        </button>
    </>

};

