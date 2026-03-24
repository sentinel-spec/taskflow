"use client";

import { action, makeObservable, observable } from "mobx";
import type { ICoreRootStore } from "./root.store";

type InstanceConfig = {
  is_email_login_enabled: boolean;
  is_magic_login_enabled: boolean;
};

export class InstanceStore {
  // Observables
  config: InstanceConfig = {
    is_email_login_enabled: true,
    is_magic_login_enabled: false,
  };

  constructor(public readonly rootStore?: ICoreRootStore) {
    makeObservable(this, {
      config: observable,
      setInstanceConfig: action,
    });
  }

  setInstanceConfig(config: InstanceConfig) {
    this.config = config;
  }
}
