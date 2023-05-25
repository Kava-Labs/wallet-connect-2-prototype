import { useWalletProvider } from './provider/WalletProvider';



const Field = ({ label, value }) => {
    return <div className="field">
        <label className="label">{label}</label>
        <div className="control">
            <input className="input" value={value} onChange={() => { }} />
        </div>
    </div>
}

const Button = ({ disabled, label, cb, color }) => {

    return <p className="control">
        <button className={`button ${color}`} onClick={cb} disabled={disabled}>
            {label}
        </button>
    </p>
};

export const Example = () => {
    const { wallet, connectWallet, signAmino, disconnectWallet } = useWalletProvider();
    const { address, chainId, sessionTopic, pairingTopic } = wallet;


    const testSignAmino = () => {
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
    }

    return <>
        <div className="box m-6 has-text-centered">
            <h1 className="title is-4"> Wallet Connect 2 </h1>
            <form onSubmit={(e) => { e.preventDefault() }}>
                <div className="p-6">
                    <Field label="Address" value={address} />
                    <Field label="Chain ID" value={chainId} />
                    <Field label="Session Topic" value={sessionTopic} />
                    <Field label="Pairing Topic" value={pairingTopic} />

                    <div className="field is-grouped is-justify-content-center">
                        <Button label="Connect" cb={connectWallet} color="is-info" />
                        <Button label="Sign Amino" cb={testSignAmino} disabled={!address} />
                        <Button label="Disconnect" cb={disconnectWallet} disabled={!address} />
                    </div>
                </div>

            </form>

        </div>


        {/* <button onClick={connectWallet}>
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
        </button> */}
    </>

};

