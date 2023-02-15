import { u64 } from '@solana/spl-token';
import Arweave from 'arweave';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { WalletAdapter, WalletError } from '@solana/wallet-adapter-base';
declare module 'coder';
declare module 'typedarray';

export type AddContactState = {
    name: string,
    solana: string,
    arweave: string,
    host: Host,
    pfp: string,
    recovery: bool,
    disable: bool,
    error: string,
    id_length: number,
    base64QRCode: string
}

// https://docs.solana.com/developing/clients/jsonrpc-api#gettokenaccountsbyowner
export type Account = {
    account: {
        lamports: number,
        owner: string,
        data: AccountData,
        executable: boolean,
        rentEpoch: number
    }
}

export type AccountData = {
    program: string,
    parsed: AccountDataParsed,
    space: number
}

export type AccountDataParsed = {
    accountType: string,
    info: AccountDataParsedInfo,
    type: string
}

export type AccountDataParsedInfo = {
    tokenAmount: TokenAmount,
    delegate: string,
    delegatedAmount: DelegatedAmount,
    state: string,
    isNative: boolean,
    mint: string,
    owner: string
}

export type ActiveView = {
    view: string,
    state: string
}

export type ActiveViewTicker = {
    view: string;
    ticker: string;
}

export type ArweaveData = {
    splPubKey: string, 
    extracted: object,
    status: ArweaveTxnStatusResp
}

export type ArweaveKeypair = {
    privateKey: ArweavePrivateKey,
    address: string,
    seed: string
}

export type ArweaveNetwork = {
    host: string,
    port: number,
    protocol: string
}

export type ArweaveSolanaSeeds = {
    arweave: string,
    solana: string
}

export type ArweaveTxnStatusResp = {
    block_height: number,
    block_indep_hash: string,
    number_of_confirmations: number
}

export type ArweaveUploadStatus = {
    txnid: string,
    status: string
}

export type Attribute = {
    type: string,
    property: string,
    count: number,
    value: string
}

export type AttributeItem = {
    index: number,
    attribute: Attribute
}

// https://github.com/metaplex-foundation/metaplex/blob/f5c971fe1d9aa7433dbe724eec4d9b1ef1b18eb3/js/packages/common/src/contexts/connection.tsx#L25
interface BlockhashAndFeeCalculator {
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
}

export type Coin = {
    name: string,
    icon: string, 
    quantity: number,
    ticker: string, 
    value: number,
    price: number,
    chainId: number
}

export type CoinGeckoSPLPriceUSD = {
    [key:string]: {
        usd: number
    }
}

export type Collection = {
    family: string,
    name: string
}

export type CollectionData = {
    symbol: string,
    floorPrice: number,
    listedCount: number,
    volumeAll: number
}

export type Contact = {
    id: string,
    name: string,
    solana: string,
    arweave: string,
    host: Host,
    pfp: string,
    recovery: boolean,
    base64QRCode: string,
    authSecret: string,
    phone: string
}

export type ContactSet = {
    [k: string]: Contact
}

export type ContactDetailItem = {
    details: Contact,
    index: number,
    id: string
}

export type Coordinate = { 
    x: number,
    y: number
}

export type Creator = {
    address: string,
    share: number,
    verified: boolean,
}

export type CreatorItem = {
    index: number,
    creator: Creator
}

export type datMinted = {
    txId: string,
    status: string
}

export type DatOwnerTxn = {
    data: {
        uri: string
    }
}

export type DatTransactionChunkResponse = {
    data: string
}

export type DatweaveOffset = {
    size: number,
    offsets: Array<number>
}

export type DelegatedAmount = {
    amount: string
    decimals: number,
    uiAmount: number,
    uiAmountString: string
}

export type File = {
    name: string,
    data: string,
    type: string,
    thumbnail: string
}

export type GlobalState = {
    AESMnemonics: string,
    arweaveAddress: string,
    arweaveConnection: Arweave,
    arweaveNetwork: string,
    arweavePrivateKey: JWKInterface | undefined,
    base64QRCode: string,
    connection: Connection,
    contacts: ContactSet,
    createMethod: string,
    isDevelopmentMode: boolean,
    password: string,
    passwordSaltSHA256: string,
    profilePic: string,
    lastLogin: Date,
    nfts: Array<NFTCardType>,
    onboardComplete: boolean,
    salt: string,
    seedTxnId: string,
    solanaAddress: string,
    solanaNetwork: string,
    solanaPrivateKey: Uint8Array,
    timeout: number,
    unlock: boolean,
    walletAlias: string
}

export type Host = {
    host: string,
    port: number,
    path: string
}

export type HostPrivateAddress = {
    host: {
        cellular: Array<string> | null,
        wifi: Array<string> | null,
        port: number
    }
}

export type Image = {
    data: string,
    image: string,
    type: string
}

export type IPConfig = {
    ipv4: String,
    ipv6: String,
    port: Number
}

export interface JWKInterface extends JWKPublicInterface {
    d: string,
    dp: string,
    dq: string,
    p: string,
    q: string,
    qi: string    
}

export interface JWKPublicInterface {
    kty: string,
    e: string,
    n: string
}

export type KeyWalletImport = {
    key: string | undefined,
    address: string | undefined,
    wallet: string
}

export type Location = {
    bottomLeftCorner: Coordinate,
    bottomLeftFinderPattern: Coordinate,
    bottomRightAlignmentPattern: Coordinate,
    bottonRightCorner: Coordinate,
    topLeftCorner: Coordinate,
    topLeftFinderPattern: Coordinate,
    topRightCorner: Coordinate,
    topRightFinderPattern: Coordinate
}

export type Metadata = {
    animation_url: string,
    attributes: Array<Attribute>,
    collection: Collection,
    date_created: string,
    description: string,
    external_url: string,
    image: string,
    name: string,
    properties: Properties,
    seller_fee_basis_points: number,
    symbol: string,
    use: Uses
}

export type Minted = {
    tokenAccount: Keypair,      
    edition: PublicKey,
    editionBump: number, 
    mint: Keypair,
    metadataPDA: PublicKey,
    arweaveTxId: string
}

export type NFTCardType = {
    [k: string]: NFTData
}

export type NFTData = {
    image: Image,
    metadata: NFTMetadata
}

export type NFTMetadata = { 
    data: Metadata
    image: string,
    type: string
}

export type PhoneOTPSecret = {
    phone: string,
    otpSecret: string
}

export type Properties = {
    category: string,
    creators: Array<Creator>,
    files: Array<File>,
    generation: number
}

export type Property = {
    attributes: Array<Attribute>,
    creators: Array<Creator>
}

export type QRDecoded = {
    binaryData: Array,
    data: string,
    chunk: Array,
    version: number,
    location: Loccation
}

export type RecoverContact = {
    info: Contact,
    otp: string
}

export type SignaturesForAddress = {
    signature: string,
    slot: number,
    err: object | null,
    memo: string |null,
    blocktime: number | null
}

export type SignaturesForAddressTxns = {
    [k: string]: SignaturesForAddress
}

export type SolanaNetwork = {
    endpoint: string,
    chainId: number
}

export type SPLToken = {
    owner: string,
    publicKey: PublicKey,
    icon: string,
    quantity: number,
    ticker: string,
    value: number,
    price: number,
    chainId: number,
    src: string
}

export type TokenAccount = {
    jsonrpc: string,
    result: TokenAccountResult,
    id: number
}

export type TokenAccountResult = {
    context: {
        slot: number
    },
    value: Array<Account>
}

export type TokenAmount = {
    amount: string
    decimals: number,
    uiAmount: number,
    uiAmountString: string
}

export type TokenPrice = {
    [key:string]: number
}

export type TransactionData = {
    tags: string,
    transaction: string,
    files: File[],
    env: string
}

export type TransactionDetailType = {
    data: SignaturesForAddress,
    href: string
}

export type TransactionOffsetResponse = {
    size: string,
    offset: string
}

export type UpdateWalletInfo = {
    name: string,
    address: string
}

export type Uses = {
    use_method: number,
    remaining: number,
    available: number
}

export type View = {
    name: string,
    icon: string,
    text: string
}

// https://github.com/metaplex-foundation/metaplex/blob/f5c971fe1d9aa7433dbe724eec4d9b1ef1b18eb3/js/packages/common/src/contexts/wallet.tsx#L242
export type WalletSigner = Pick<
  WalletAdapter,
  WalletContextState
//   'publicKey' | 'signTransaction' | 'signAllTransactions'
>

export type WebRTCConnection = {
    host: string,
    port: number,
    path: string
}