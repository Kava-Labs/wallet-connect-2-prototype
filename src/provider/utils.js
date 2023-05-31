// @ts-check
import { Web3Modal } from "@web3modal/standalone";
import SignClient from "@walletconnect/sign-client";

// @ts-ignore
const projectId = import.meta.env["VITE_WALLET_CONNECT_PROJECT_ID"];

export const defaultWallet = { address: "", chainId: "", sessionTopic: "", pairingTopic: "" };

export const web3Modal = new Web3Modal({
    walletConnectVersion: 2,
    projectId,
});


/**
 * @param {string} projectId 
 * @returns {Promise<SignClient>}
 */
export const initSignClient = async (projectId) => {
    return await SignClient.init({ projectId })
};


export const isSignClientInitialized = (client) => !client ? false : true;

export const establishSession = async (signClient, namespaces) => {
    const { uri, approval } = await signClient.connect({
        requiredNamespaces: namespaces,
    });
    web3Modal.openModal({ uri, standaloneChains: namespaces.cosmos.chains });
    const session = await approval();
    return session;
}


/**
 * 
 * @param {SignClient} signClient 
 */
export const getSession = (signClient) => {
    const sessions = signClient.session.getAll();
    const lastSessionIndex = sessions.length - 1;
    if (sessions.length) {
        return sessions[lastSessionIndex];
    }
    return null;
};


export const getActivePairing = (signClient) => {
    let last;
    for (const pairing of signClient.pairing.getAll()) {
        if (pairing.active) {
            last = pairing;
        }
    }
    return last ? last : null;
};

export const checkForExistingSessionAndPairing = (signClient) => {
    if (!signClient) {
        return null;
    }
    const session = getSession(signClient);
    if (session) {
        const pairing = getActivePairing(signClient);
        if (pairing) {
            
            return { session, pairing };
        }
    }

    return null;
}

export const establishSessionAndPairing = async (signClient, namespaces) => {
    if (!signClient) {
        return null;
    }

    const session = await establishSession(signClient, namespaces);
    const pairing = getActivePairing(signClient);
    return { session, pairing }
};


export const addressFromNamespacedAddr = (addressWithNamespace) => {
    return addressWithNamespace.substring(addressWithNamespace.lastIndexOf(":") + 1)
}

export const chainIdFromNamespacedAddr = (addressWithNamespace) => {
    return addressWithNamespace.substring(addressWithNamespace.indexOf(":") + 1, addressWithNamespace.lastIndexOf(":"));
}


export const getSessionAccounts = (session) => {
    return session.namespaces[Object.keys(session.namespaces)[0]].accounts;
};


export const withTimeout = async(
    promiseFn,
    timeoutMs = 1000
  ) => {
    return new Promise(async (resolve, reject) => {
      const tid = setTimeout(() => {
        reject(`timeout after: ${timeoutMs}ms`);
      }, timeoutMs);
  
      try {
        const res = await promiseFn();
        resolve(res);
        clearTimeout(tid);
        return;
      } catch (err) {
        reject(err);
        clearTimeout(tid);
        return;
      }
    });
  };
  
