---
title: SSL and TLS
date: 2023-11-12T23:25:00.000Z
lastmod: 2023-11-12T23:25:00.000Z
description: SSL and TLS ~
tags: [ "Network" ]
categories : [ "Network" ]
---

## SSL/TLS

## WHAT IS SSL / TLS

### SSL

SSL is Secure Socket Layer

The predecessor of TLS

### TLS

TLS is Transport Layer Security

A cryptographic protocol that provides secure communication over a computer network

## HISTORY

* SSL 2.0
  * Published 1995 Deprecated 2011
* SSL 3.0
  * Published 1996 Deprecated 2015
* TLS 1.0
  * Published 1999 Deprecated 2020
* TLS 1.1
  * Published 2006 Deprecated 2020
* TLS 1.2
  * Published 2008 
* TLS 1.3
  * Published 2018 

## USED

* Website
  * HTTPS = HTTP + TLS
* Email
  * SMTPS = SMTP + TLS
* File Transfer
  * FTPS = FTP + TLS

## WHY TLS

* Authentication
  * Verify the identity of the communicating parties with asymmetric cryptography

* Confidentiality
  * Protect the exchanged data from unauthorized access with asymmetric cryptography
* Integrity
  * Prevent alteration of data during transmission with message authentication code

## HOW TLS WORKS

1. Handshake protocol
   * Negotiate TLS protocol version
   * Select cryptographic algorithms: cipher suites
   * Authenticate by asymmetric cryptography
   * Establish a secret key for symmetric encryption
2. Record protocol
   * Encrypt outgoing message with the secret key
   * Transmit the encrypted messages
   * Decrypt incoming message with the secret key
   * Verify that the message are not modified

## Create & sign SSL/TLS certificates with openssl

gen.sh

```shell
rm -rf *.pem
# 1. Generate CA's private key and self-signed certificate
openssl req -x509 -newkey rsa:4096 -days 365 -nodes -keyout ca-key.pem -out ca-cert.pem -subj "/C=CN/ST=Shanghai/L=Shanghai/O=Education/OU=Education/CN=*.ca.com/emailAddress=test@email.com"

echo "CA's self-signed certificate"
openssl x509 -in ca-cert.pem -noout -text
# 2. Generate web server's private key and certificate signing request (CSR)
openssl req -newkey rsa:4096 -nodes -keyout server-key.pem -out server-req.pem -subj "/C=CN/ST=Shanghai/L=Shanghai/O=TEST1/OU=TEST2/CN=*.server.com/emailAddress=test@email.com"
# 3. Use CA's private key to sign web server's CSR and get back signed certificate
openssl x509 -req -in server-req.pem -days 60 -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -extfile server-ext.cnf

echo "Server's self-signed certificate"
openssl x509 -in server-cert.pem -noout -text
```



server-ext.cnf

```markdown
subjectAltName=DNS:*.test.com,DNS:*.test.org,IP:0.0.0.0
```



verify

```shell
openssl verify -CAfile ca-cert.pem server-cert.pem
```



