package com.sail.wallet

import android.Manifest.permission.*
import android.content.ContentResolver
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.provider.Telephony.Sms.Inbox
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.telephony.SmsManager
import android.telephony.TelephonyManager
import android.util.Base64
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat.getSystemService
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONObject
import java.io.IOException
import java.io.OutputStream
import java.math.BigInteger
import java.net.*
import java.nio.charset.StandardCharsets
import java.security.KeyFactory
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.PublicKey
import java.security.interfaces.ECPublicKey
import java.security.interfaces.RSAPublicKey
import java.security.spec.RSAPublicKeySpec
import java.util.*
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import kotlin.math.ceil
import kotlin.random.Random
import android.content.Context
import kotlinx.coroutines.*


private const val KEYSIZE = 256
private const val KEYPAIR_ALG = "RSA"
private const val CIPHER_ALG = "RSA/NONE/OAEPWithSHA1AndMGF1Padding" //PKCS1Padding"
private const val HOST = "0.0.0.0"
private const val PORT = 3019
private const val URI = "p2p://"
private const val LOWER_RENDEZVOUS = 10L // rendezvous time must by within 50 ms
private const val UPPER_RENDEZVOUS = 20L
private var DATA_ON = false

class InvalidAddressBookException(message: String): Exception(message)
class InvalidPhaseException(message: String): Exception(message)
class InvalidOTPException(message: String): Exception(message)
class InvalidProtocolException(message: String): Exception(message)
class InvalidUnixEpochException(message: String): Exception(message)

/*
 First parameter to registerPlugin() is the plugin name, which must
 match the name attribute of our @CapacitorPlugin annotation
 https://capacitorjs.com/docs/v3/android/custom-code#javascript
 */
@CapacitorPlugin(name = "Server")
class ServerPlugin : Plugin() {
    val manager = SmsManager.getDefault()
    private val initUnixMs = System.currentTimeMillis()
    private val otpWindow = 2
    private val window = 30 * otpWindow // 30 seconds/OTP
    private val supportedProtocols = arrayOf("tcp")

    private val keygen = KeyPairGenerator.getInstance(KEYPAIR_ALG)
    private var keypair: KeyPair? = null
    private var internetProtocol: MutableMap<String, String> = Collections.synchronizedMap(mutableMapOf())

    // Address book schema:
    // key: phone, value: (<publickey created by client of "phone">,
    //                     <keypair your client generated in response>,
    //                     <list of OTP>)
    private var addressBook: MutableMap<String, Triple<PublicKey?, KeyPair?, ArrayList<String>>>? =
                             Collections.synchronizedMap(mutableMapOf())

    // key: phone, value: <initial message time>
    private var sessions: MutableMap<String, Long>? = Collections.synchronizedMap(mutableMapOf())


    /*
    Testing EC public key
    */
    private fun generateECPubKey() {
        val kpg: KeyPairGenerator = KeyPairGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_EC,
            "AndroidKeyStore")
        val parameterSpec: KeyGenParameterSpec = KeyGenParameterSpec.Builder("alias",
            KeyProperties.PURPOSE_SIGN).run {
            setDigests(KeyProperties.DIGEST_SHA256)
            build()
        }
        kpg.initialize(parameterSpec)
        val keyPair = kpg.generateKeyPair()

        val ecpk = keyPair.public as ECPublicKey

        println("ECPK - public: ${keyPair.public.toString()}")
        println("ECPK - private: ${keyPair.private.toString()}")
        println("ECPK - affineX: ${ecpk.w.getAffineX()}")
        println("ECPK - affineY: ${ecpk.w.getAffineY()}")

        //https://developer.android.com/reference/java/security/spec/ECPublicKeySpec
    }

    /*
    Called when plugin is created
    */
    override fun load() {
        keygen.initialize(KEYSIZE)
        keypair = keygen.generateKeyPair()
        generateECPubKey()


        // Network requests cannot be in main thread.
        // Exceptions that occur in coroutines do not appear in logs.
        // This will fail if getIP() cannot reach the internet.
        // TODO: Might be better to move this call to a PluginCall so that it doesn't affect the entire application.
        GlobalScope.launch {
             internetProtocol.put("v4", getIP(context, version=4))
             internetProtocol.put("v6", getIP(context, version=6))
        }


        // Call Kotlin server from here
        GlobalScope.launch {
            val coroutineExceptionHandler = CoroutineExceptionHandler{_, throwable ->
                throwable.printStackTrace()
            }

            println("Listening for TCP connection")
            listen()
        }

        GlobalScope.launch {
            val coroutineExceptionHandler = CoroutineExceptionHandler{_, throwable ->
                throwable.printStackTrace()
            }

            println("Listening for SMS handshake")
            receiveSMS()
        }

        // Uncomment to observe that the addressbook is synchronized
        GlobalScope.launch {
            val coroutineExceptionHandler = CoroutineExceptionHandler{_, throwable ->
                throwable.printStackTrace()
            }

            while (true) {
                Thread.sleep(5000)
            }
        }
    }


    /*
    Get public IPv4 address.
    inputs:
    version (Int) Either 4 for ipv4 or 6 for ipv6. Default is 4.

    outputs:
    publicAddress (String) IPv4 address
    */
    private suspend fun getIP(context: Context, version: Int = 4): String {
        // IPv4 public sources
        val publicIPV4Sources: Array<Pair<String, String>> = arrayOf(
            Pair("", "https://api.ipify.org/"),
            Pair("", "http://checkip.amazonaws.com/"),
            Pair("", "https://ip4.seeip.org"),
            Pair("", "https://api4.my-ip.io/ip"),
            Pair("ipString", "https://api.bigdatacloud.net/data/client-ip"),
            Pair("query", "http://ip-api.com/json/?fields=query"))

        // IPv6 public sources
        val publicIPV6Sources: Array<Pair<String, String>> = arrayOf(
            Pair("", "https://api64.ipify.org/"),
            Pair("", "https://ip6.seeip.org"),
            Pair("", "https://api6.my-ip.io/ip"))

        val sources = if(version == 4) publicIPV4Sources else publicIPV6Sources
        var addresses = mutableMapOf<String, Int>()

        for(src in sources) {
            try {
                with(URL(src.second).openConnection() as HttpURLConnection) {
                    if(responseCode == 200) {
                        inputStream.bufferedReader().use {
                            if(src.first.length > 0) {
                                val resp = JSONObject(it.readText())
                                val addr = resp[src.first] as String
                                if(addresses.contains(addr)) addresses[addr]?.plus(1) else addresses[addr] = 0
                            }
                            else {
                                it.lines().forEach { line ->
                                    if(addresses.contains(line))  addresses[line]?.plus(1) else addresses[line] = 0
                                }
                            }
                        }
                    }
                }
            }
            catch(e: IOException) {
                println("(getIP) IOException: $e")

                // Need context dispatcher to main because can only display Toast from main thread
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Must Enable Internet Connection", Toast.LENGTH_SHORT).show()
                }

                withContext(Dispatchers.Default) {
                    DATA_ON = false
                }
            }
            finally {
                return ""
            }
        }

        withContext(Dispatchers.Default) {
            DATA_ON = true
        }

        return (addresses.maxBy { it.value }).key
    }


    /*

    inputs:
    messages (List<String>)

    output:
    time (String?) Latest time as a nullable String
    */
    fun getLatestTime(messages: List<MutableMap<String, String>>): String? {
        println(messages)
        return messages[messages.size-1]["date"]
    }


    /*
    Listens for SMS for p2p-protocol handshake from initiating peers
    */
    private fun receiveSMS() {
        var hasNewMessage = false
        var lastSeenProtocolMessage = initUnixMs.toString()

        while(true) {
            val messages = getAllSmsFromProvider(sinceDate=lastSeenProtocolMessage, keyword=URI)

            if(messages.isNotEmpty()) {
                val nextLatestTime = getLatestTime(messages).toString()
                hasNewMessage = lastSeenProtocolMessage != nextLatestTime

                if(hasNewMessage) {
                    lastSeenProtocolMessage = nextLatestTime
                }
            }

            println("msg - here")
            if(!hasNewMessage) {
                println("msg - sleeping")
                Thread.sleep(5000)
                continue
            }

            println("msg count: ${messages.size}")

            for(msg in messages) {
                if(msg["body"] == null) continue

                if(msg["body"]!!.contains("pubkey?")) {
                    GlobalScope.launch {
                        receivePublicKey(msg)
                    }
                }
                else if(msg["body"]!!.contains("xkey?")) {
                    GlobalScope.launch {
                        receiveResponseKey(msg)
                    }
                }
                else if(msg["body"]!!.contains("init?")) {
                    println("msg: receiveInitMessage")
                    GlobalScope.launch {
                        receiveInitMessage(msg)
                    }
                }
                else if(msg["body"]!!.contains("accept?")) {
                    println("msg: acknowledge")
                    GlobalScope.launch {
                        acknowledge(msg)
                    }
                }
                else if(msg.contains("sync?")) {
                    GlobalScope.launch {
                        synchronize(msg)
                    }
                }
            }

            Thread.sleep(5000)
        }
    }


    /*
    Initiates p2p protocol handshake
    */
    @PluginMethod
    fun handshake(call: PluginCall) {
        if(addressBook?.isEmpty()!!) {
            println("handshake addressbook empty")
            return
        }
        println("handshake1")

        // TODO: Set timeout counter in coroutine. Dropped session if timeout.

        val hasPermission = ActivityCompat.checkSelfPermission(activity.getApplicationContext(), SEND_SMS) == PackageManager.PERMISSION_GRANTED

        if(!hasPermission) {
            ActivityCompat.requestPermissions(activity, arrayOf(SEND_SMS), 0)
        }
        println("handshake2")

        // 1. Exchange public keys
        val pubkey = keypair?.public as RSAPublicKey
        val modulus = pubkey.modulus
        val exponent = pubkey.publicExponent
        val phone = call.getString("phone")

        println("handshake: ${phone}")

        if(phone != null) {
            addressBook?.put(phone, Triple(null, keypair, arrayListOf()))
            manager.sendTextMessage(phone, null, "${URI}pubkey?${modulus},${exponent}", null, null)
        }
        else {
            val ret = JSObject()
            ret.put("resp", -1)
            call.resolve(ret)
        }
    }


    /*
    Public key API
    Receive public key over SMS from peer

    inputs:
    message (String) SMS containing public key

    */
    private fun receivePublicKey(message: MutableMap<String, String>) {
        val body = message["body"]!!
        val phase = body.split("?")[0].split("//")[1]
        val modulus = body.split("?")[1].split(",")[0]
        val exponent = body.split(",")[1]
        val publicKey = constructPublicKey(modulus, exponent)
        val phone = message["address"]

        if(phase != "pubkey") {
            throw InvalidPhaseException("Invalid phase: ${phase}")
        }


        // 1. Save public key associated with phone number in addressBook
        val isFirstEntry = !addressBook?.contains(phone)!!

        // TODO: Discard public keys when done
        // Public keys are created for each connection. After each session whether or not
        // successful, both keys are discarded and entries are set to null
        val hasNoPeerPubKey = addressBook?.get(phone)?.first == null
        val hasNoPubKey = addressBook?.get(phone)?.second == null
        val isSubsequentSession = hasNoPeerPubKey && hasNoPubKey

        if(phone != null && (isFirstEntry || isSubsequentSession)) {
            val hasPermission = ActivityCompat.checkSelfPermission(activity.getApplicationContext(), SEND_SMS) == PackageManager.PERMISSION_GRANTED

            if(!hasPermission) {
                ActivityCompat.requestPermissions(activity, arrayOf(SEND_SMS), 0)
            }

            // 2. Generate new keypair for this message
            val tempKeygen = KeyPairGenerator.getInstance(KEYPAIR_ALG)
            tempKeygen.initialize(KEYSIZE)
            val tempKeypair = tempKeygen.generateKeyPair()

            addressBook?.set(phone, Triple(publicKey, tempKeypair, arrayListOf("")))

            // 3. Reply with own public key
            val tempPubKey = tempKeypair.public.toString().split(',')
            val tempModulus = tempPubKey[0].split("=")[1]
            val tempExponent = tempPubKey[1].split("=")[1].split("}")[0]

            // xkey - stands for "exchange key"
            manager.sendTextMessage(phone, null, "${URI}xkey?${tempModulus},${tempExponent}", null, null)
        }

        // 4. In later stage - need close phase to discard these keys
    }

    /*
    Source: https://stackoverflow.com/a/57329741/3158028

    inputs:
    modulus  (String) RSA public key modulus
    exponent (String) RSA exponent

    outputs:
    publicKey (KeyFactory.PublicKey) Reconstructed public key
    */
    private fun constructPublicKey(modulus: String, exponent: String): PublicKey {
        println("constructPublicKey - modulus: $modulus exponent: $exponent")
        val modulusBigInt = BigInteger(modulus, 16)
        val exponentBigInt = BigInteger(exponent)

        val spec = RSAPublicKeySpec(modulusBigInt, exponentBigInt)
        val factory = KeyFactory.getInstance("RSA")
        return factory.generatePublic(spec)
    }


    /*
    API for receiving peer's public key in response to initial request from handshake()

    inputs:
    message (MutableMap<String, String>) Message containing public key from peer
    */
    private fun receiveResponseKey(message: MutableMap<String, String>) {
        val body = message["body"]!!
        val phase = body.split("?")[0].split("//")[1]
        val modulus = body.split("?")[1].split(",")[0]
        val exponent = body.split(",")[1]
        val publicKey = constructPublicKey(modulus, exponent)
        val phone = message["address"]!!

        if(phase != "xkey") {
            throw InvalidPhaseException("Invalid phase: ${phase}")
        }

        var contact = addressBook?.get(phone)
        if (contact != null) {
            addressBook?.set(phone, Triple(publicKey, contact.second, contact.third))
            val msg = initMessage(phone)
            manager.sendTextMessage(phone, null, msg, null, null)
        }
    }


    /*
    inputs:
    phone (String) Phone to key into addressBook for public key

    outputs:
    message (String) Message with encrypted parameters for phase 1 of p2p protocol
    */
    private fun initMessage(phone: String): String {
        val initTimeMS = System.currentTimeMillis()
        val otp = addressBook?.get(phone)?.third?.last()
        val pubkey = addressBook?.get(phone)?.first

        val protocol = "tcp"
        val msg = "$initTimeMS:$otp:$protocol"
        println("initMessage: (${msg.length}) $msg\tpubkey: $pubkey")
//        val message = encrypt(pubkey, msg)
//        println("initMessage: $message")

        sessions?.put(phone, initTimeMS)
        return "${URI}init?$msg"
    }


    /*
    Reply to init phase of p2p protocol

    inputs:
    message (MutableMap<String, String>) Text message containing _id, address, body, date, type
    */
    private fun receiveInitMessage(message: MutableMap<String, String>) {
        // TEST: Echo back p2p://pubkey?..., but change to p2p://xkey?
        //       Then echo p2p://init?... verbatim, make sure to remove line breaks
        //       Check how far it gets down this function
        val body = message["body"]!!
        val phone = message["address"]!!
        // val ciphertext = body?.split("?")?.last() ?: return
        // val message = decrypt(ciphertext)
        var (phase, parameters) = body.split("?")
        phase = phase.split("//")[1]
        val (time, otp, protocol) = parameters.split(":")

        println("body $body")

        if(phase != "init") {
            throw InvalidPhaseException("Invalid phase: $phase")
        }

        //val parameters = // message?.split(":")
        //val time = parameters?.get(0)
        //val otp = parameters?.get(1)
        //val protocol = parameters?.get(2)

//        if(!isValidOTP(phone, otp)) {
//            throw InvalidOTPException("Invalid OTP: $otp")
//        }
//
//        if(!isValidUnixEpoch(time)) {
//            throw InvalidUnixEpochException("Invalid Unix Epoch $time")
//        }
//
//        if(!isValidProtocol(protocol)) {
//            throw InvalidProtocolException("Invalid protocol $protocol")
//        }

        val accepted = acceptMessage(phone)

        println("accepted: $accepted")

        manager.sendTextMessage(phone, null, accepted, null, null)
    }


    /*
    Verify that the OTP given in the handshake is valid

    inputs:
    phone (String?) Sender's phone number
    otp   (String?) One-time password to verify
    time  (String) Unix epoch in milliseconds when text was received

    outputs:
    valid (Boolean) True, if addressBook contains phone key and given otp
    */
    private fun isValidOTP(phone: String?, otp: String?): Boolean {
        if(otp == null || otp.isEmpty() || phone == null || phone.isEmpty()) return false

        val contact = addressBook?.get(phone)

        if(contact == null) return false
        return contact.third.contains(otp)
    }


    /*
    Check that given Unix epoch time is within window +/-

    inputs:
    time (String?) Unix epoch time

    outputs:
    valid (Boolean) True, if given time is within the window
    */
    private fun isValidUnixEpoch(time: String?): Boolean {
        if(time == null || time.isEmpty()) return false
        val currentEpoch = System.currentTimeMillis()
        return (currentEpoch - window) <= time.toLong() && time.toLong() <= (currentEpoch + window)
    }


    /*
    Check that suggested protocol is supported

    inputs:
    protocol (String?) Protocol for communicating secret shares

    outputs:
    valid (Boolean) True, if given protocol is supported
    */
    private fun isValidProtocol(protocol: String?): Boolean {
        if(protocol == null || protocol.isEmpty()) return false

        return supportedProtocols.contains(protocol)
    }


    /*
    inputs:
    phone (String) Phone to key into addressBook

    outputs:
    message (String) Formatted message for accept phase
    */
    private fun acceptMessage(phone: String): String {
        val initTimeMS = System.currentTimeMillis()
        val otp = "otp"
        val publicIP = internetProtocol["v4"]
        val privateIP = internetProtocol["v6"]

        // TODO: Pass phone to encrypt() to look up public key to use
        val msg = "$initTimeMS:$otp:$publicIP:$privateIP"
        //val message = encrypt(addressBook?.get(phone)?.first, msg)

        return "${URI}accept?$msg"
    }


    /*
    inputs:

    outputs:
    */
    private fun acknowledge(message: MutableMap<String, String>) {
        val body = message["body"]!!
        val phone = message["address"]!!

        var (phase, parameters) = body.split("?")
        phase = phase.split("//")[1]
        val (time, otp) = parameters.split(":")

        // TODO: check if time is valid
        // TODO: check if otp is valid
        // TODO: determine rendezvous time

        val publicIP = internetProtocol["v4"]
        val privateIP = internetProtocol["v6"]

        val initTime = sessions?.get(phone)
        val rtt = time.toLong() - initTime!!
        val onewayTime = ceil((rtt/2).toDouble())
        val rendezvous = Random.nextLong(LOWER_RENDEZVOUS, UPPER_RENDEZVOUS)
        val untilRendezvous = onewayTime + rendezvous

        val message = "${URI}sync?$rendezvous,$publicIP,$privateIP"
        manager.sendTextMessage(phone, null, message, null, null)

        GlobalScope.launch {
            Thread.sleep(untilRendezvous as Long)
            simultaneousOpen(publicIP!!, privateIP!!, PORT)
        }
    }


    /*
    Reply to sync phase of p2p protocol
    Execute simultaneous open

    inputs:
    message (MutableMap<String, String>) Text message containing _id, address, body, date, type
    */
     private fun synchronize(message: MutableMap<String, String>) {
        val body = message["body"]!!
        val parameters = body.split("?")[1]
        val (rendezvousTime, publicIP, privateIP) = parameters.split(",")

        Thread.sleep(rendezvousTime.toLong())

        simultaneousOpen(publicIP, privateIP, PORT)
     }


    /*
    Simultaneous TCP open

    inputs:
    publicIP  (String) Public address IPv4
    privateIP (String) Private address IPv6
    port      (Int)    Application port number
    */
    private fun simultaneousOpen(publicIP: String, privateIP: String, port: Int) {
        // Socket(host: String!, port: Int, localAddr: InetAddress!, localPort: Int)
        // Creates a socket and connects it to the specified remote host on the specified remote port.
        val socket = Socket(publicIP, port, InetAddress.getByName(privateIP), port)
        socket.bind(InetSocketAddress(internetProtocol["ipv4"], port))
        socket.connect(InetSocketAddress(publicIP, port))
        socket.close()
    }


    /*
    Call whenever frontend's OTP changes. Default set to every 30 seconds.
    */
    @PluginMethod
    fun updateOTPQueue(call: PluginCall) {
        val phone = call.getString("phone")!!
        val otp = call.getString("otp")

        println("Added otp: $otp")

        if(otp == null || phone == null) {
            return
        }

        var contact = addressBook?.get(phone)

        if(contact == null) {
            addressBook?.set(phone, Triple(null, null, arrayListOf(otp)))
        }
        else {
            var otpQueue = contact.third

            if(otpQueue.contains(otp)) {
                return
            }

            otpQueue.add(otp)

            if(otpQueue.size > otpWindow) {
                otpQueue.subList(0, otpQueue.size - otpWindow).clear()
            }

            addressBook?.set(phone, Triple(contact.first, contact.second, otpQueue))
        }
    }


    /*
    MutableMap where the key is a phone number and the key is an ArrayList<String> of valid OTPs
    */
    @PluginMethod
    fun setAddressBook(call: PluginCall) {
        val addressBookObject = call.getObject("addressBook")
//        for(key in addressBookObject.keys()) {
//            if(!addressBook.containsKey(key)) {
//                addressBook[key] = ArrayList<String>()
//            }
//            addressBook[key].add(addressBookObject.getString(key))
//        }
    }


    /*
    Returns private IP address
    */
    @PluginMethod
    fun getFullIP(call: PluginCall) {
        while(internetProtocol["v4"] == null || internetProtocol["v6"] == null) {
            continue
        }

        val ips = mapOf(
            "ipv4" to internetProtocol["v4"],
            "ipv6" to internetProtocol["v6"],
            "port" to PORT
        )

        val json = JSONObject(ips)
        val ret = JSObject()
        ret.put("resp", json.toString())
        call.resolve(ret)
    }


    /*
    Send secret share to peer to encrypt
    */
    @PluginMethod
    fun encryptShare(call: PluginCall) {
        val share = call.getString("share")
        val peer = call.getString("peer")

        // 1. Open socket to peer on port 3019
        // 2. Wait for reply
        // 3. call.resolve() // key value for return object is 'resp' in DATServerPluginAPI.ts
    }


    /*
    Send encrypted share to peer to decrypt
    */
     @PluginMethod
     fun decryptShare(call: PluginCall) {
        // val encrypted = call.getString("encrypted")
        // val peer = call.getString("peer")

        // 1. Open socket to peer on port 3019
        // 2. Wait for reply
        // 3. call.resolve() // key value for return object is 'resp' in DATServerPluginAPI.ts
     }


    /*
    Gets system's phone number
    */
    @PluginMethod
    fun getPhoneNumber(call: PluginCall) {
        val hasPermission = ActivityCompat.checkSelfPermission(activity.getApplicationContext(), READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED

        if(!hasPermission) {
            ActivityCompat.requestPermissions(activity, arrayOf(READ_PHONE_NUMBERS), 0)
        }

        val manager = getSystemService(context, TelephonyManager::class.java) as TelephonyManager
        val phone = manager.getLine1Number()

        val ret = JSObject()
        ret.put("resp", phone)
        call.resolve(ret)
    }


    /*
    Returns public key to frontend
    */
    @PluginMethod
    fun getPublicKey(call: PluginCall) {
        // TODO:
        // 1. Generate keypair
        // 2. Store keypair
        // 3. Assign public key to resp and return
        val ret = JSObject()
        ret.put("resp", keypair?.getPublic().toString())
        call.resolve(ret)
    }


    /*
    Citation:
    https://gist.github.com/awesometic/f1f52acf5904189f687724e42c461413#file-rsacipher-java-L74
    
    inputs:
    pubkey  (PublicKey?) Public key
    message (String)     Plaintext message to encrypt

    outputs:
    cipher (String) Ciphertext of message
    */
    private fun encrypt(pubkey: PublicKey?, message: String): String {
        var ciphertext = ""

//        try {
            val rsapub = pubkey as RSAPublicKey
            val mod = rsapub.modulus
            val exp = rsapub.publicExponent

            println("encrypted1 - mod: $mod\texp: $exp")
            val cipher = Cipher.getInstance(CIPHER_ALG);
            println("encrypted2 - $pubkey")
            cipher.init(Cipher.ENCRYPT_MODE, pubkey!!);
            println("encrypted3")
            val encryptedBytes = cipher.doFinal(message.toByteArray(StandardCharsets.UTF_8));

            println("encrypted: $encryptedBytes")

            ciphertext = Base64.encodeToString(encryptedBytes, Base64.DEFAULT);
//        }
//        catch(e: Exception) {
//            println("Error encrypting:\n$e")
//        }

        println("encrypted: $pubkey")
        println("encrypted: $ciphertext")
        val test = decrypt(ciphertext)
        println("encrypted: $test")

        return ciphertext
    }


    /*
    Citation:
    https://gist.github.com/awesometic/f1f52acf5904189f687724e42c461413#file-rsacipher-java-L97

    inputs:
    message (String) Ciphertext to decrypt

    outputs:
    plaintext (String) Decrypted message
    */
    private fun decrypt(message: String): String {
        var plaintext = ""

        try {
            val cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA1AndMGF1Padding");
            cipher.init(Cipher.DECRYPT_MODE, keypair?.private);
            val decryptedBytes = cipher.doFinal(Base64.decode(message, Base64.DEFAULT));
            plaintext = String(decryptedBytes);
        }
        catch(e: Exception) {
            println("Error decrypting\n$e")
        }

        return plaintext
    }


    /*
    Decreca
    Source: https://stackoverflow.com/questions/8083479/java-getting-my-ip-address/14364233#14364233

    outputs:
    ipAddresses (ArrayList<String>>) List of IP addresses
    */
    @Deprecated("Use getIP(version:Int) instead")
    fun getIPAddress(): Map<String, ArrayList<String>> {
        var ip: String
        val cellularAddresses: ArrayList<String> = arrayListOf()
        val wifiAddresses: ArrayList<String> = arrayListOf()
        val ipAddresses = mapOf("cellular" to cellularAddresses, "wifi" to wifiAddresses)

        try {
            val interfaces: Enumeration<NetworkInterface> = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val iface: NetworkInterface = interfaces.nextElement()
                // filters out 127.0.0.1 and inactive interfaces
                if (iface.isLoopback() || !iface.isUp()) continue
                val addresses: Enumeration<InetAddress> = iface.getInetAddresses()
                while (addresses.hasMoreElements()) {
                    val addr: InetAddress = addresses.nextElement()
                    ip = addr.getHostAddress()
                    // rmnet_data0 is the cellular network device ip address
                    // wlan0 is wifi network device ip address
                    if(iface.displayName == "rmnet_data0") {
                        ipAddresses["cellular"]?.add(ip)
                    }
                    else if(iface.displayName == "wlan0") {
                        ipAddresses["wifi"]?.add(ip)
                    }
                }
            }
        } catch (e: SocketException) {
            throw RuntimeException(e)
        }
        return ipAddresses
    }


    /*
    citations:
    1. https://stackoverflow.com/a/19966854/3158028
    2. https://stackoverflow.com/a/10870333/3158028

    inputs:
    sinceDate  (String)  Starting date for returned text messages
    keyword    (String)  Substring contained in body of text
    ignoreCase (Boolean) Ignore keyword substring match case

    outputs:
    texts (List<String>) List of text messages given inputs
    */
    private fun getAllSmsFromProvider(sinceDate: String="0", keyword: String="", ignoreCase: Boolean=true): List<MutableMap<String, String>> {
        val hasPermission = ActivityCompat.checkSelfPermission(activity.getApplicationContext(), READ_SMS) == PackageManager.PERMISSION_GRANTED

        if(!hasPermission) {
            ActivityCompat.requestPermissions(activity, arrayOf(READ_SMS), 0)
        }

        val projection = arrayOf("_id", "address", "body", "date", "type")
        val lstSms: MutableList<MutableMap<String, String>> = ArrayList()
        val cr: ContentResolver = activity.contentResolver
        val c: Cursor? = cr.query(
            Uri.parse("content://sms/inbox"),
            projection,
             null,
            null,
            Inbox.DEFAULT_SORT_ORDER // default sort order is "date desc"
        )

        val targetDate = sinceDate.toLong()

        if(targetDate <= 0) {
            return lstSms
        }

        // moveToFirst moves Cursor to the latest text when sorted by DEFAULT_SORT_ORDER
        if (c != null && c.moveToFirst()) {
            val addressColumnIndex = c.getColumnIndex("address")
            val bodyColumnIndex = c.getColumnIndex("body")
            val dateColumnIndex = c.getColumnIndex("date")
            val typeColumnIndex = c.getColumnIndex("type")

            // Find text with Unix epoch and start search from there
            var left = 0 // last text message received
            var right = c.getCount()-1
            var startPosition = left

            val lastDate = c.getString(dateColumnIndex).toLong()
            var midIndexDate = 0L

            // Could not find any new messages
            if(targetDate > lastDate) {
                return lstSms
            }

            while(left <= right) {
                val mid = (right + left) / 2
                c.moveToPosition(mid)
                midIndexDate = c.getString(dateColumnIndex).toLong()

                if(midIndexDate == targetDate) {
                    startPosition = mid
                    break
                }

                if(targetDate > midIndexDate) {
                    left = mid + 1
                }
                else {
                    right = mid - 1
                }
            }

            for(i in startPosition downTo 0) {
                c.moveToPosition(i)
                val body = c.getString(bodyColumnIndex)

                val message: MutableMap<String, String> = mutableMapOf()
                message["address"] = c.getString(addressColumnIndex)
                message["date"] = c.getString(dateColumnIndex)
                message["type"] = c.getString(typeColumnIndex)
                message["body"] = body

                if(keyword.isNotEmpty() && body.contains(keyword, ignoreCase=ignoreCase)) {
                    lstSms.add(message)
                }
                else if(keyword.isEmpty()) {
                    lstSms.add(message)
                }
            }
        } else {
            throw java.lang.RuntimeException("You have no SMS in Inbox")
        }

        c.close()

        return lstSms
    }


    /*
    Listen for incoming TCP connections
    */
    fun listen() {
        /*
        The maximum queue length (backlog, second parameter in ServerSocket) for incoming connection indications (a request to connect) is set to 50. If a
        connection indication arrives when the queue is full, the connection is refused.
         */
        val addr = InetAddress.getByName(HOST)
        val server = ServerSocket(PORT, 50, addr)

        println("Server is running on ${server.localSocketAddress}:${server.localPort}")

        while (true) {
            println("Waiting for connection")
            try {
                val client = server.accept()
                val hostAddress = client.inetAddress.hostAddress
                println("Client connected: $hostAddress")

                // Run client in it's own thread.
                 GlobalScope.launch {
                     Connection(client).run()
                 }
            }
            catch(e: IOException) {
                println("failed connection")
                e.printStackTrace()
            }
        }
    }
}


/*

*/
class Connection(var client: Socket) {
    private val reader: Scanner = Scanner(client.getInputStream())
    private val writer: OutputStream = client.getOutputStream()
    private var running: Boolean = false

    // TODO: Instantiate storage

    fun run() {
        running = true

        println("Client handler running!")
        val message = StringBuilder()

        while (running) {
            try {
                val text = reader.nextLine()
                // message.append(reader.nextLine())
                message.append(text)
                println("data: $text")

                if(text == "EXIT") {
                    break
                }
            } catch (ex: Exception) {
                shutdown()
            }
        }

        writer.write(encrypt(message))
        shutdown()
    }


    /*
    Encrypt secret share

    inputs:

    outputs:
    */
    private fun encrypt(message: StringBuilder): ByteArray {
        try {
            val plaintext: ByteArray = message.toString().encodeToByteArray()

            val keygen = KeyGenerator.getInstance(KEYPAIR_ALG)
            keygen.init(KEYSIZE)
            val key: SecretKey = keygen.generateKey()
            // TODO: store key

            val cipher = Cipher.getInstance(CIPHER_ALG)
            cipher.init(Cipher.ENCRYPT_MODE, key)
            return cipher.doFinal(plaintext)
        }
        catch(e: Exception) {
            println("Error encrypting")
        }

        return byteArrayOf()
    }


    /*
    Decrypt secret share

    inputs:

    outputs:
    */
    private fun decrypt(message: StringBuilder): ByteArray {
        // TODO: restore key
        try {
            val cipherText: ByteArray = message.toString().encodeToByteArray()
            // --- REMOVE LATER ---
            val keygen = KeyGenerator.getInstance(KEYPAIR_ALG)
            keygen.init(256)
            val key: SecretKey = keygen.generateKey()
            // --- REMOVE LATER ---

            val cipher = Cipher.getInstance(CIPHER_ALG)
            cipher.init(Cipher.DECRYPT_MODE, key)
            return cipher.doFinal(cipherText)
        }
        catch(e: Exception) {
            println("Error decrypting")
        }
        return byteArrayOf()
    }

    private fun shutdown() {
        running = false
        client.close()
        println("${client.inetAddress.hostAddress} closed the connection")
    }
}