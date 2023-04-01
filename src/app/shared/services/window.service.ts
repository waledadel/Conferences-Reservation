import { Injectable } from '@angular/core';
import { ClassProvider, FactoryProvider, InjectionToken, PLATFORM_ID } from '@angular/core';

export const WINDOW = new InjectionToken('WindowToken');

export abstract class WindowRef {
  get nativeWindow(): Window | Object {
    throw new Error('Not implemented.');
  }
}

@Injectable({
  providedIn: 'root'
})
export class WindowService extends WindowRef {

  constructor() { 
    super();
  }

  override get nativeWindow(): Window | Object {
    return window;
  }
}

function windowFactory(browserWindowRef: WindowService, platformId: Object): Window | Object {
  return browserWindowRef.nativeWindow;
}

const browserWindowProvider: ClassProvider = {
  provide: WindowRef,
  useClass: WindowService
};

export const windowProvider: FactoryProvider = {
  provide: WINDOW,
  useFactory: windowFactory,
  deps: [ WindowRef, PLATFORM_ID ]
};

export const WINDOW_PROVIDERS = [
  browserWindowProvider,
  windowProvider
];