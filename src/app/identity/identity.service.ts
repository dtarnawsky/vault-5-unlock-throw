import { Injectable, NgZone } from '@angular/core';
import { AuthMode, Device, DeviceSecurityType, Vault, VaultMigrator, VaultType } from '@ionic-enterprise/identity-vault';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {

  constructor(private $zone: NgZone) { }

  public async init() {

    this.$vault = new Vault({
      key: 'myapp.vault',
      type: VaultType.InMemory,
      deviceSecurityType: DeviceSecurityType.Both,
      androidBiometricsPromptTitle: 'MyApp Login',
      lockAfterBackgrounded: 60 * 60000
    })

    await Device.setHideScreenOnBackground(true)

    // attempt migration from Vault 4 if needed
    try {
      // VaultMigrator config must match the old Vault 4 config
      const migrator = new VaultMigrator({
        authMode: AuthMode.InMemoryOnly,
        androidPromptTitle: 'MyApp Login',
        restoreSessionOnReady: false,
        unlockOnReady: false,
        unlockOnAccess: false,
        lockAfter: 60 * 60000,
        hideScreenOnBackground: true,
        allowSystemPinFallback: true,
        shouldClearVaultAfterTooManyFailedAttempts: false
      })
      // check if there's data in the old vault
      const oldData = await migrator.exportVault();
      // if there is old data
      if (!!oldData) {
        // import data into new vault
        await this.$vault.importVault(oldData);
        // clear the legacy vault
        await migrator.clear();
      }
    } catch (err) {
      // errors from VaultMigrator are OK
      console.log('Vault 4 migration failed', err)
    }
  }
  /**
   * encapsulated instance of the vault
   */
  private $vault: Vault
  /**
   * Gets the Ionic Identity Vault instance. You probably shouldn't be using this.
   */
  public getVault() {
    return this.$vault
  }
  /**
   * Checks if there is a saved session (tokens) in the vault
   */
  public isEmpty() {
    return this.$vault.isEmpty()
  }
  /**
   * Unlock the vault (shows biometric prompt if enrolled)
   */
  public unlock() {
    return this.$zone.run(() => this.$vault.unlock())
  }
  /**
   * Locks the vault (does not clear the vault)
   */
  public lock() {
    return this.$zone.run(() => this.$vault.lock())
  }
  /**
   * Clears all token from the vault
   */
  public clear() {
    return this.$vault.clear()
  }
  /**
   * If device has biometrics and user has set it up in Android
   */
  public isBiometricsAvailable() {
    return Device.isBiometricsEnabled()
  }
  /**
   * Returns true if vault lock type uses biometrics
   */
  public async isBiometricsEnrolled() {
    return this.$vault.config.type === VaultType.DeviceSecurity
  }
  /**
   * Enables biometrics, making the vault require biometrics (ie: fingerprint)
   * to unlock. Tokens won't be forgotten when vault is locked.
   */
  public enableBiometricAccess() {
    return this.$zone.run(() => this.$vault.updateConfig({ ...this.$vault.config, type: VaultType.DeviceSecurity }))
  }
  /**
   * Disables biometrics, making the vault "forget" any tokens when the app is
   * killed or if the vault is otherwsie locked, ie: inactivity timeout.
   */
  public disableBiometricAccess() {
    return this.$zone.run(() => this.$vault.updateConfig({ ...this.$vault.config, type: VaultType.InMemory }))
  }
}
