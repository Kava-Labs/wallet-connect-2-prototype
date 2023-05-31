import { useEffect, useState } from 'react';
import { useWalletProvider } from './provider/WalletProvider';

const defaultNamespace = {
    cosmos: {
        methods: ["cosmos_getAccounts", "cosmos_signDirect", "cosmos_signAmino"],
        chains: ["cosmos:kava_2222-10"],
        events: ["chainChanged", "accountsChanged"],
    },
}

const Field = ({ label, value, onChange, placeholder, statusIcon }) => {
    return <div className="field">
        <label className="label">{label} {statusIcon ? statusIcon : null}</label>
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


const Status = ({ ok, label, lastChecked }) => {
    return <div className="icon-text">
        <span>{label} Status: </span>
        {
            ok ?
                <span className="icon has-text-success">
                    <i className="fas fa-check-square"></i>
                </span>
                :
                <span className="icon has-text-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                </span>
        }
        <span> Last checked: {lastChecked}</span>
    </div>
}

export const Example = () => {
    const [connectTo, setConnectTo] = useState(defaultNamespace);
    const { wallet, connectWallet, signAmino, disconnectWallet, sessionStatus, pairingStatus } = useWalletProvider();
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

                    {
                        sessionTopic && sessionStatus &&
                        <Status ok={sessionStatus.ok} label="Session Topic" lastChecked={sessionStatus.lastChecked} />

                    }
                    <Field label="Session Topic" value={sessionTopic} onChange={() => { }} />


                    {
                        pairingTopic && pairingStatus &&
                        <Status ok={pairingStatus.ok} label="Pairing Topic" lastChecked={pairingStatus.lastChecked} />

                    }
                    <Field label="Pairing Topic" value={pairingTopic} onChange={() => { }} />


                    

                    <label className="label">Choose Chain</label>

                    <div style={{ display: 'flex', justifyContent: "center"}}>
                        <button
                            style={{ margin: '15px'}}
                            onClick={
                                () => {
                                    setConnectTo((prev) => {
                                        const newNamespace = { ...prev };
                                        newNamespace.cosmos.chains = ['cosmos:kava_2222-10'];
                                        return newNamespace;
                                    })
                                }
                            }
                        >Kava Chain Only
                        </button>

                        <button
                            style={{ margin: '15px'}}
                            onClick={
                                () => {
                                    setConnectTo((prev) => {
                                        const newNamespace = { ...prev };
                                        newNamespace.cosmos.chains = ['cosmos:Binance-Chain-Ganges'];
                                        return newNamespace;
                                    })
                                }
                            }
                        >Binance Chain Only
                        </button>

                        <button
                            style={{ margin: '15px'}}
                            onClick={
                                () => {
                                    setConnectTo((prev) => {
                                        const newNamespace = { ...prev };
                                        newNamespace.cosmos.chains = ['cosmos:kava_2222-10', 'cosmos:Binance-Chain-Ganges'];
                                        return newNamespace;
                                    })
                                }
                            }
                        >Binance & Kava Chain
                        </button>
                    </div>

                    {
                        !wallet.address && <Field label="Enter Namespace:" value={connectTo.cosmos.chains} onChange={(e) => {
                            setConnectTo((prev) => {
                                const newNamespace = { ...prev };
                                
                                const values = e.target.value.split(',').map(v => v.trim())
                                
                                newNamespace.cosmos.chains = values;
                                return newNamespace;
                            })
                        }} placeholder="cosmos:kava_2222-10" />

                    }

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

