# BalanceBot Arduino Compiler Service

This optional Node service accepts Arduino source and returns an Intel HEX artifact.

## Run locally

```bash
node server.mjs
```

The endpoint is:

```text
POST http://127.0.0.1:8787/api/compile
```

Payload:

```json
{"board":"arduino:avr:uno","code":"void setup(){} void loop(){}"}
```

The service writes each sketch to a temporary directory, invokes `arduino-cli compile`, returns the `.hex` text, and removes the temporary directory. It does not execute untrusted binaries; deployment should still use a restricted container, non-root user, resource limits, and an allow-list of boards.

## Container

```bash
docker build -t balancebot-compiler ./compiler-service
docker run --rm -p 8787:8787 balancebot-compiler
```

Set the browser endpoint before loading the site:

```html
<body data-compile-endpoint="http://127.0.0.1:8787/api/compile">
```
