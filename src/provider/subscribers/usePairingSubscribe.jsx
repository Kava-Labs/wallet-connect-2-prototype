import { useEffect, useState } from 'react';
import { isSignClientInitialized, defaultWallet, withTimeout } from '../utils';
import SignClient from "@walletconnect/sign-client";

/**
 * subscribes to Wallet Connect 2 pairing events
 * Warning: only for use inside WalletProvider
 * @param {SignClient} signClient 
 * @param {string} pairingTopic 
 * @param {React.Dispatch<{ address: string, chainId: string, sessionTopic: string, pairingTopic: string  }>} setWalletCB 
 */

export const usePairingSubscribe = (signClient, pairingTopic, setWalletCB) => {

    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (!isSignClientInitialized(signClient) || !pairingTopic) {
            return;
        }

        const handlePairingDelete = (ev) => {
            console.log("received event: pairing_delete", ev);
            if (ev.topic === pairingTopic) {
                setWalletCB({ ...defaultWallet });
                setStatus(null);
            }
        };

        const handlePairingExpired = (ev) => {
            console.log("received event: pairing_expired", ev);
            setWalletCB({ ...defaultWallet });
            setStatus(null);
        };


        const handlePairingPing = () => {
            console.log("received event: pairing_ping");
        };

        withTimeout(async () => await signClient.core.pairing.ping({ topic: pairingTopic }))
            .then(() => setStatus({
                ok: true,
                lastChecked: new Date().toString(),
            }))
            .catch(() => setStatus({
                ok: false,
                lastChecked: new Date().toString(),
            }));

        console.log("subscribing to events on pairing topic: ", pairingTopic);
        signClient.core.pairing.events.on("pairing_delete", handlePairingDelete);
        signClient.core.pairing.events.on("pairing_expire", handlePairingExpired);
        signClient.core.pairing.events.on("pairing_ping", handlePairingPing);

        return () => {
            if (!isSignClientInitialized(signClient) || !pairingTopic) {
                return;
            }

            console.log("unsubscribing to events on pairing topic: ", pairingTopic);
            signClient.core.pairing.events.off("pairing_delete", handlePairingDelete);
            signClient.core.pairing.events.off("pairing_expire", handlePairingExpired);
            signClient.core.pairing.events.off("pairing_ping", handlePairingPing);
        }


    }, [signClient, pairingTopic])


    useEffect(() => {
        if (!signClient || !pairingTopic) {
            return;
        }

        const id = setInterval(async () => {
            try {
        
                await withTimeout(async () => await signClient.core.pairing.ping({ topic: pairingTopic }));
                setStatus({
                    ok: true,
                    lastChecked: new Date().toString(),
                })
            } catch (err) {
                setStatus({
                    ok: false,
                    lastChecked: new Date().toString(),
                })
            }

        }, 5000);

        return () => {
            if (!signClient || !pairingTopic) {
                return;
            };

            clearInterval(id);
        }


    }, [signClient, pairingTopic])


    return status
};
