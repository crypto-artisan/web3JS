import * as sinonLib from 'sinon';
import ProvidersPackage from 'web3-providers';
import AccountsPackage from 'web3-eth-accounts';
import TransactionSigner from '../../src/signers/TransactionSigner';

const sinon = sinonLib.createSandbox();

/**
 * TransactionSigner test
 */
describe('TransactionSignerTest', () => {
    let transactionSigner,
        provider,
        providerMock,
        providerAdapter,
        providerAdapterMock,
        accounts,
        accountsMock;

    beforeEach(() => {
        provider = new ProvidersPackage.WebsocketProvider('ws://127.0.0.1', {});
        providerMock = sinon.mock(provider);

        providerAdapter = new ProvidersPackage.SocketProviderAdapter(provider);
        providerAdapterMock = sinon.mock(providerAdapter);

        accounts = AccountsPackage.createAccounts(provider);
        accountsMock = sinon.mock(accounts);

        transactionSigner = new TransactionSigner();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('calls sign and throws error', () => {
        transactionSigner.sign({from: 0}, accounts).catch(error => {
            expect(error.message).equal('Wallet or privateKey in wallet is not set!');
        });
    });

    it('calls sign and returns signed transaction', async () => {
        accounts.wallet[0] = {privateKey: '0x0'};
        const transaction = {
            from: 0
        };

        accountsMock
            .expects('signTransaction')
            .withArgs(transaction, '0x0')
            .returns(
                new Promise(resolve => {
                    resolve('0x0');
                })
            )
            .once();

        const returnValue = await transactionSigner.sign(transaction, accounts);

        expect(returnValue).equal('0x0');
        expect(transaction.from).equal(undefined);

        accountsMock.verify();
    });
});
