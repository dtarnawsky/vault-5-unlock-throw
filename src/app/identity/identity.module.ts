import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { VaultErrorCodes } from '@ionic-enterprise/identity-vault';
import { IdentityService } from './identity.service';

/**
 * If user cancels the unlock, keep trying; otherwise throw
 * 
 * @param $identity 
 */
const unlock = async ($identity: IdentityService) => {
  try {
    await $identity.unlock()
  } catch (error) {
    if (error?.code === VaultErrorCodes.UserCanceledInteraction) {
      await unlock($identity)
    } else throw error
  }
}

@NgModule({
  declarations: [],
  imports: [],
})
export class IdentityModule {
  static forRoot(): ModuleWithProviders<IdentityModule> {
    return {
      ngModule: IdentityModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: ($identity: IdentityService) => async () => {
            if (Capacitor.isNativePlatform()) {
              console.log('isNative')
              try {
                console.log('before init')
                await $identity.init()
                await unlock($identity)
              } catch (err) {
                // if an error during unlock, clear the vault
                console.log('error during APP_INIT unlock()', JSON.stringify(err))
                await $identity.clear()
              }
            }
          },
          deps: [IdentityService],
          multi: true
        }
      ],
    };
  }
}
