# Tesior

### Debug

1. Incorrect rustc version in `cargo-build-sbf --version`
 
Error
```
error: package solana-program v1.18.1cannot be built because it requires rustc 1.72.0 or newer, 
while the currently active rustc version is 1.68.0-dev Either upgrade to rustc 1.72.0 or newer,
or use cargo update -p solana-program@1.18.1 --precise ver whereveris the latest version of
solana-program supporting rustc 1.68.0-dev
```

Solution

```
solana-install update
```