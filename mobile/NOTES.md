## Phone2Phone: A Peer-to-peer Handshake without an Intermediary Rendevous Server

### Definitions

Dynamic NAT
Static NAT
Local port
NAT port
Port preservation - local port is mapped to the same port on the NAT

### Background
-  What is range in size of RSA private keys?
-  What are the corresponding data block sizes for those key sizes?


### Other ideas
encrypting entire message including header
using entropy to detect encrypted messages instead of string matching on headers

### Possible attack vectors: 
dos sms to poison spam classifiers to automatically filter legitimate encrypted messages

### Challenges
For private keys of size 2048, data block to encrypt should be less than 256 characters. However, because this part is part of the SMS handshake, actually limited to 160 characters.

Limitations of SMS is 160 characeter. The string containging the URI, public key modulus and public exponents is 173 characters long.


p2p://pubkey?9915840099287551178758509013685353092736788745683405810814803782297679637662229518159314873616757601973563120439614097892300324864311151508354245820176633,65537


Removing the URI makes the message exactly 160 characters.

9915840099287551178758509013685353092736788745683405810814803782297679637662229518159314873616757601973563120439614097892300324864311151508354245820176633,65537


### Citations
https://www.rfc-editor.org/rfc/rfc5382.txt
https://www.efani.com/blog/silent-sms-dos-attack