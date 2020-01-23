# angular-simple-user-idle

Service for Angular 6+ to detect and control of user's idle.

[![npm version](https://badge.fury.io/js/angular-simple-user-idle.svg)](https://badge.fury.io/js/angular-simple-user-idle)

## Important
This library is a fork of [angular-user-idle](https://github.com/rednez/angular-user-idle) by [rednez](https://github.com/rednez)

### Installation (outdated)

`npm install angular-user-idle`

In app.module.ts:
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { UserIdleModule } from 'angular-user-idle';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    
    // Optionally you can set time for `idle`, `timeout` and `ping` in seconds.
    // Default values: `idle` is 600 (10 minutes), `timeout` is 300 (5 minutes) 
    // and `ping` is 120 (2 minutes).
    UserIdleModule.forRoot({idle: 600, timeout: 300, ping: 120})
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Usage (outdated)

You should init user idle service in one of core component or service of your app,
for example login.component.ts:

```typescript
import { Component, OnInit } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';

@Component({
  templateUrl: './login.component.jade'
})
export class LoginComponent implements OnInit {

  readonly googlePlayLink: string;
  readonly appStoreLink: string;

  constructor(private userIdle: UserIdleService) {
  }

  ngOnInit() {
    //Start watching for user inactivity.
    this.userIdle.startWatching();
    
    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => console.log(count));
    
    // Start watch when time is up.
    this.userIdle.onTimeout().subscribe(() => console.log('Time is up!'));
  }

  stop() {
    this.userIdle.stopTimer();
  }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  startWatching() {
    this.userIdle.startWatching();
  }

  restart() {
    this.userIdle.resetTimer();
  }
}
```

### API (outdated)
`startWatching(): void;`

Start user idle service and configure it.

`onTimerStart(): Observable<number>`

Fired when timer is starting and return observable (stream) of timer's count. 

`onTimeout(): Observable<boolean>;`

Fired when time is out and id user did not stop the timer. 

`stopTimer()`

Stop timer.

`resetTimer()`

Reset timer after onTimeout() has been fired.

`stopWatching()`

Stop user idle service.

`setConfigValues({idle, timeout, ping})`

Set config values after module was initialized.

`setCustomActivityEvents(customEvents: Observable<any>): void`

Set custom activity events after module was initialized.

##### Service logic: (outdated)
- User is inactive for 10 minutes
- `onTimerStart()` is fire and return countdown for 5 minutes
- If user did not stop timer by `stopTimer()` then time is up and `onTimeout()` is fire.
