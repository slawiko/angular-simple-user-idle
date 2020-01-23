import { Injectable, NgZone, Optional } from '@angular/core';
import {
  fromEvent,
  interval,
  merge,
  Observable,
  Subject,
  Subscription,
} from 'rxjs';
import {
  bufferTime,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { UserIdleConfig } from './user-idle.config';

export const DEFAULT_ACTIVITY_EVENTS$ = merge(
    fromEvent(window, 'mousemove'),
    fromEvent(window, 'resize'),
    fromEvent(document, 'keydown')
);

export const DEFAULT_CONFIG: UserIdleConfig = {
  timeout: 300,
  sensitivityMilliseconds: 1500,
};

/**
 * User's idle service.
 */
@Injectable({
  providedIn: 'root'
})
export class UserIdleService {
  protected config: UserIdleConfig;

  /**
   * Events that can interrupts user's inactivity timer.
   */
  protected activityEvents$: Observable<any>;

  /**
   * UNIX-time in seconds when last user activity happened.
   */
  protected lastActivity: number;

  protected timeout$ = new Subject<boolean>();

  /**
   * Timer of user's inactivity is in progress.
   */
  protected isIdleDetected: boolean;
  protected idleDetected$ = new Subject<boolean>();

  protected idleSubscription: Subscription;
  protected activitySubscription: Subscription;

  static nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  constructor(@Optional() config: UserIdleConfig, private _ngZone: NgZone) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.setIdleness = this.setIdleness.bind(this);
    this.runTimer = this.runTimer.bind(this);

    this.lastActivity = UserIdleService.nowInSeconds();
  }

  /**
   * Start watching for user idle
   */
  startWatching() {
    this.stopWatching();

    if (!this.activityEvents$) {
      this.activityEvents$ = DEFAULT_ACTIVITY_EVENTS$;
    }

    this.activitySubscription = this.activityEvents$.pipe(
        bufferTime(this.config.sensitivityMilliseconds),
        filter(arr => !!arr.length),
        tap(() => {
          this.lastActivity = UserIdleService.nowInSeconds();
        }),
    ).subscribe();

    // If no new activity events produced for idle seconds then start timer.
    this.idleSubscription = this.activityEvents$.pipe(
        bufferTime(this.config.sensitivityMilliseconds),
        filter(arr => !arr.length && !this.isIdleDetected),
        map(() => true),
        tap(this.setIdleness),
        switchMap(() => this._ngZone.runOutsideAngular(this.runTimer))
    ).subscribe();
  }

  stopWatching() {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
    }
  }

  /**
   * Return observable for idle status changed
   */
  onIdleStatusChanged(): Observable<boolean> {
    return this.idleDetected$.asObservable();
  }

  /**
   * Return observable for timeout is fired.
   */
  onTimeout(): Observable<boolean> {
    return this.timeout$.pipe(
        filter(timeout => !!timeout),
        tap(() => {
          this.stopWatching()
        }),
        map(() => true)
    );
  }

  getConfig(): UserIdleConfig {
    return this.config;
  }

  /**
   * Set custom activity events
   *
   * @param customEvents Example: merge(
   *   fromEvent(window, 'mousemove'),
   *   fromEvent(window, 'resize'),
   *   fromEvent(document, 'keydown'),
   *   fromEvent(document, 'touchstart'),
   *   fromEvent(document, 'touchend')
   * )
   */
  setCustomActivityEvents(customEvents: Observable<any>) {
    if (this.idleSubscription && !this.idleSubscription.closed) {
      console.error('Call stopWatching() before set custom activity events');
      return;
    }

    this.activityEvents$ = customEvents;
  }

  protected setIdleness(idleness: boolean): void {
    this.isIdleDetected = idleness;
    this.idleDetected$.next(this.isIdleDetected);
  }

  protected runTimer(): Observable<any> {
    return interval(1000).pipe(
        takeUntil(this.activityEvents$),
        tap(() => {
          if (this.lastActivity + this.config.timeout < UserIdleService.nowInSeconds()) {
            this.timeout$.next(true);
          }
        }),
        finalize(() => this.setIdleness(false)),
    )
  }
}
