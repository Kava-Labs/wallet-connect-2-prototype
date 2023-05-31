import { useState } from 'react';
import { useWalletProvider } from './provider/WalletProvider';


const defaultNamespace = {
    cosmos: {
        methods: ["cosmos_getAccounts", "cosmos_signDirect", "cosmos_signAmino"],
        chains: ["cosmos:kava_2222-10"],
        events: ["chainChanged", "accountsChanged"],
    },
}




const Field = ({ label, value, onChange, placeholder }) => {
    return <div className="field">
        <label className="label">{label}</label>
        <div className="control">
            <input className="input" value={value} onChange={onChange} placeholder={placeholder} />
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
    const [connectTo, setConnectTo] = useState(defaultNamespace);
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
                    <Field label="Address" value={address} onChange={() => { }} />
                    <Field label="Chain ID" value={chainId} onChange={() => { }} />
                    <Field label="Session Topic" value={sessionTopic} onChange={() => { }} />
                    <Field label="Pairing Topic" value={pairingTopic} onChange={() => { }} />

                    <Field label="Connect To" value={connectTo.cosmos.chains[0]} onChange={(e) => {
                        setConnectTo((prev) => {
                            const newNamespace = { ...prev };
                            newNamespace.cosmos.chains[0] = e.target.value;
                            return newNamespace;
                        })
                    }} placeholder="cosmos:kava_2222-10" />

                    <div className="field is-grouped is-justify-content-center">
                        <Button label="Connect" cb={() => {
                            connectWallet(connectTo)
                        }} color="is-info" />
                        <Button label="Sign Amino" cb={testSignAmino} disabled={!address} />
                        <Button label="Disconnect" cb={disconnectWallet} disabled={!address} />
                    </div>
                </div>

            </form>

        </div>


    </>

};

