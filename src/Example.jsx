import { useWalletProvider } from './provider/WalletProvider';



export const Example = () => {
    const { wallet, connectWallet, signAmino, disconnectWallet } = useWalletProvider();
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
        <button onClick={() => {
            signAmino({
                signerAddress: address,
                signDoc: {
                    chain_id: chainId,
                    account_number: "7",
                    sequence: "54",
                    memo: "hello, world",
                    msgs: [],
                    fee: { "amount": [], "gas": "23" }
                }
            })
        }} disabled={!address}>
            Sign Tx
        </button>
        <button onClick={disconnectWallet} disabled={!address}>
            Disconnect
        </button>
    </>

};

