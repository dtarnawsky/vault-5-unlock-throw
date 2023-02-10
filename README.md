# Vault5UnlockThrow

### Demonstration of Vault 5 throwing with unlock()

1. Clone this repo
2. Add in Ionic enterprise credentials
3. `npm install`
4. `npm run build:android`
5. `npx cap open android`
6. Run app on emulator and click "Enroll Biometrics" once app is opened
7. Background and kill the app, then open it again
8. Observe logs for error info occuring at `unlock()` in identity.module.ts