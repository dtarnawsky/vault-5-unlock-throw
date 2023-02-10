import { Component, OnInit } from '@angular/core';
import { IdentityService } from './identity/identity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'vault-5-unlock-throw';

  constructor(private $identity: IdentityService) { }

  async ngOnInit() {

    const key = 'test';
    const value = 'mithrandir'

    const isEmpty = await this.$identity.isEmpty()
    console.log(`vault ${isEmpty ? 'IS' : 'IS NOT'} empty`)

    const existingValue = await this.$identity.getVault().getValue<string>(key)
    console.log('existingValue', existingValue)

    if (existingValue === value) {
      console.log('value exists and is correct')
    }

    await this.$identity.getVault().setValue('test', 'mithrandir')
    console.log('re-set value again')
  }

  async enroll() {
    await this.$identity.enableBiometricAccess()
    console.log('enrolled', await this.$identity.isBiometricsEnrolled())
  }

  async disenroll() {
    await this.$identity.disableBiometricAccess()
    console.log('enrolled', await this.$identity.isBiometricsEnrolled())
  }
}
