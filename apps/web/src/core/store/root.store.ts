"use client";

import { makeAutoObservable } from "mobx";
import { InstanceStore } from "./instance.store";
import { IssueStore } from "./issue";
import { UserStore } from "./user";
import { ViewStore } from "./view";
import { WorkspaceStore } from "./workspace.store";

export interface ICoreRootStore {
  user: UserStore;
  instance: InstanceStore;
  workspace: WorkspaceStore;
  issue: IssueStore;
  view: ViewStore;
}

export class CoreRootStore implements ICoreRootStore {
  user: UserStore;
  instance: InstanceStore;
  workspace: WorkspaceStore;
  issue: IssueStore;
  view: ViewStore;

  constructor() {
    this.user = new UserStore(this);
    this.instance = new InstanceStore(this);
    this.workspace = new WorkspaceStore(this);
    this.issue = new IssueStore(this);
    this.view = new ViewStore(this);
    makeAutoObservable(this);
  }

  reset() {
    this.user = new UserStore(this);
    this.instance = new InstanceStore(this);
    this.workspace = new WorkspaceStore(this);
    this.issue = new IssueStore(this);
    this.view = new ViewStore(this);
  }
}

export const rootStore = new CoreRootStore();
