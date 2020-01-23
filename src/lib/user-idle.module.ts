import { ModuleWithProviders, NgModule } from '@angular/core';
import { UserIdleConfig } from './user-idle.config';

@NgModule({
  imports: []
})
export class UserIdleModule {
  static forRoot(config: UserIdleConfig): ModuleWithProviders {
    return {
      ngModule: UserIdleModule,
      providers: [
        {provide: UserIdleConfig, useValue: config}
      ]
    };
  }
}
