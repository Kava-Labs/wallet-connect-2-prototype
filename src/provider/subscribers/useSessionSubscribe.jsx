//@ts-check
import React, { useEffect } from 'react';
import { web3Modal, isSignClientInitialized, defaultWallet } from '../utils';
import SignClient from "@walletconnect/sign-client";


/**
 * subscribes to Wallet Connect 2 session events
 * Warning: only for use inside WalletProvider
 * @param {SignClient} signClient 
 * @param {string} sessionTopic 
 * @param {React.Dispatch<{ address: string, chainId: string, sessionTopic: string, pairingTopic: string  }>} setWalletCB 
 */

export const useSessionSubscribe = (signClient, sessionTopic, setWalletCB) => {
    useEffect(() => {
        if (!isSignClientInitialized(signClient)) {
            return;
        }

        const sessionEventHandler = (ev) => {
            console.info("session_event: ", ev);
            alert('received session_event event');
        };

        const sessionUpdateHandler = (ev) => {
            console.info("session_update:", ev);
            alert('received session_update event');
        };

        const sessionDeletedHandler = (ev) => {
            console.info("session_delete", ev);
            setWalletCB({ ...defaultWallet });
        };

        const sessionExpiredHandler = (ev) => {
            console.info("session_expire", ev);
            setWalletCB({ ...defaultWallet });
        };

        const sessionProposalExpire = (ev) => {
            console.log("proposal_expire", ev);
            alert("proposal_expire");
        };


        const sessionPingHandler = () => {
            console.info("session_ping");
        };

        try {
            if (!isSignClientInitialized(signClient)) {
                return;
            }

            if (!sessionTopic) {
                return;
            }
            // small note(sah): signClient.session.get throws when key is not found
            const session = signClient.session.get(sessionTopic);
            console.log("subscribing to events on session: ", session);

            signClient.on("session_event", sessionEventHandler);
            signClient.on("session_update", sessionUpdateHandler);
            signClient.on("session_expire", sessionExpiredHandler);
            signClient.on("proposal_expire", sessionProposalExpire);
            signClient.on("session_delete", sessionDeletedHandler);
            signClient.on("session_ping", sessionPingHandler);
        } catch (err) {
            console.warn(err);
            setWalletCB({ ...defaultWallet });
        }

        return () => {
            if (!sessionTopic || !signClient) {
                return;
            }
            console.info("unsubscribing from sesion: ", sessionTopic);
            signClient.off("session_event", sessionEventHandler);
            signClient.off("session_update", sessionUpdateHandler);
            signClient.off("session_expire", sessionExpiredHandler);
            signClient.off("session_delete", sessionDeletedHandler);
            signClient.off("proposal_expire", sessionProposalExpire);
            signClient.off("session_ping", sessionPingHandler);
        }

    }, [signClient, sessionTopic])


};
