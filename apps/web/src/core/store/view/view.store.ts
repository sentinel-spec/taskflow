"use client";

import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { viewService } from "@/core/services/view.service";
import type {
  CreateViewDto,
  IView,
  IViewMap,
  UpdateViewDto,
} from "@/core/types/view.types";
import type { ICoreRootStore } from "../root.store";

export class ViewStore {
  views: IViewMap = {};
  viewIds: number[] = [];
  isLoading = false;
  currentViewId: number | null = null;

  constructor(public readonly rootStore: ICoreRootStore) {
    makeObservable(this, {
      views: observable,
      viewIds: observable,
      isLoading: observable,
      currentViewId: observable,
      setViews: action,
      addView: action,
      removeView: action,
      setCurrentViewId: action,
      fetchViews: action,
      createView: action,
      updateView: action,
      deleteView: action,
      clear: action,
      allViews: computed,
      currentView: computed,
      defaultView: computed,
    });
  }

  setViews(views: IView[]) {
    const nextMap: IViewMap = {};
    const nextIds: number[] = [];

    views.forEach((view) => {
      nextMap[view.id] = view;
      nextIds.push(view.id);
    });

    this.views = nextMap;
    this.viewIds = nextIds;

    if (this.currentViewId !== null && nextMap[this.currentViewId]) {
      return;
    }

    const defaultView =
      views.find((view) => view.is_default) ?? views[0] ?? null;
    this.currentViewId = defaultView?.id ?? null;
  }

  addView(view: IView) {
    this.views[view.id] = view;

    if (!this.viewIds.includes(view.id)) {
      this.viewIds.push(view.id);
    }

    if (view.is_default) {
      this.viewIds.forEach((id) => {
        if (id === view.id) return;
        const current = this.views[id];
        if (!current) return;
        this.views[id] = {
          ...current,
          is_default: false,
        };
      });
    }

    if (this.currentViewId === null) {
      this.currentViewId = view.id;
    }
  }

  removeView(viewId: number) {
    delete this.views[viewId];
    this.viewIds = this.viewIds.filter((id) => id !== viewId);

    if (this.currentViewId === viewId) {
      const nextCurrent = this.defaultView ?? this.allViews[0] ?? null;
      this.currentViewId = nextCurrent?.id ?? null;
    }
  }

  setCurrentViewId(viewId: number | null) {
    this.currentViewId = viewId;
  }

  clear() {
    this.views = {};
    this.viewIds = [];
    this.currentViewId = null;
    this.isLoading = false;
  }

  async fetchViews(workspaceId: number, projectId: number) {
    this.isLoading = true;
    try {
      const views = await viewService.list(workspaceId, projectId);
      runInAction(() => {
        this.setViews(views);
      });
      return views;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createView(
    workspaceId: number,
    projectId: number,
    data: CreateViewDto,
  ) {
    const view = await viewService.create(workspaceId, projectId, data);

    runInAction(() => {
      this.addView(view);
      this.currentViewId = view.id;
    });

    return view;
  }

  async updateView(
    workspaceId: number,
    projectId: number,
    viewId: number,
    data: UpdateViewDto,
  ) {
    const view = await viewService.update(workspaceId, projectId, viewId, data);

    runInAction(() => {
      this.addView(view);
    });

    return view;
  }

  async deleteView(workspaceId: number, projectId: number, viewId: number) {
    await viewService.delete(workspaceId, projectId, viewId);

    runInAction(() => {
      this.removeView(viewId);
    });
  }

  get allViews(): IView[] {
    return this.viewIds
      .map((id) => this.views[id])
      .filter((view): view is IView => view !== undefined);
  }

  get currentView(): IView | null {
    if (this.currentViewId === null) return null;
    return this.views[this.currentViewId] ?? null;
  }

  get defaultView(): IView | null {
    return this.allViews.find((view) => view.is_default) ?? null;
  }
}
