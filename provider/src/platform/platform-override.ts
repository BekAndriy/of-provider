import type OpenFin from "@openfin/core";
import {
  OpenGlobalContextMenuPayload,
  type CreateSavedWorkspaceRequest,
  type UpdateSavedWorkspaceRequest,
  type Workspace,
  type WorkspacePlatformProvider,
  GlobalContextMenuOptionType,
  GlobalContextMenuItemTemplate,
  Page,
  CreateSavedPageRequest,
  getCurrentSync,
  UpdateSavedPageRequest
} from "@openfin/workspace-platform";
import * as api from '../api'
import { mapArray } from "../utils/data";
import { CustomActionsIds, PlatformCustomActions } from "./platform-custom-actions";
import { StoreFolder } from "../api/store";
import { TokenManager } from "../utils/token-manager";

// /**
//  * Override methods in the platform.
//  * @param WorkspacePlatformProvider The workspace platform class to extend.
//  * @param platformProviderSettings The settings for the platform provider.
//  * @param browserProviderSettings The settings for the browser provider.
//  * @param versionInfo The app version info.
//  * @returns The overridden class.
//  */
export function createPlatformOverride(
  WorkspacePlatformProvider: OpenFin.Constructor<WorkspacePlatformProvider>,
): WorkspacePlatformProvider {
  /**
   * Create a class which overrides the platform provider.
   */
  class Override extends WorkspacePlatformProvider {
    private async loadData<T>(api: StoreFolder) {
      const workspaces = await api.get().catch(() => []);
      const recordsPromises = workspaces.map(({ name }) => api.get(name));
      const records = await Promise.allSettled(recordsPromises) || [];
      const fulfilledRecords = records.map((record) => record.status === 'fulfilled' ? record.value : null).filter(Boolean);
      return fulfilledRecords as T[]
    }

    //     /**
    //      * Gets the current state of windows and their views and returns a snapshot object containing that info.
    //      * @param payload Undefined unless you've defined a custom `getSnapshot` protocol.
    //      * @param identity Identity of the entity that called getSnapshot.
    //      * @returns Snapshot of current platform state.
    //      */
    public async getSnapshot(payload: undefined, identity: OpenFin.Identity): Promise<OpenFin.Snapshot> {
      const snapshot = await super.getSnapshot(payload, identity);

      // Decorate the default snapshot with additional information for connection clients.
      return snapshot;
    }

    //     /**
    //      * Implementation for getting a list of saved workspaces from persistent storage.
    //      * @param query an optional query.
    //      * @returns The list of saved workspaces.
    //      */
    public async getSavedWorkspaces(query?: string): Promise<Workspace[]> {
      const records = await this.loadData<Workspace>(api.store.workspaces);
      return records
    }


    //     /**
    //      * Implementation for creating a saved workspace in persistent storage.
    //      * @param req the create saved workspace request.
    //      */
    public async createSavedWorkspace(req: CreateSavedWorkspaceRequest): Promise<void> {
      await api.store.workspaces.save(req.workspace.title, { ...req.workspace, workspaceId: req.workspace.title });
    }

    //     /**
    //      * Implementation for updating a saved workspace in persistent storage.
    //      * @param req the update saved workspace request.
    //      */
    public async updateSavedWorkspace(req: UpdateSavedWorkspaceRequest): Promise<void> {
      await api.store.workspaces.save(req.workspace.title, { ...req.workspace, workspaceId: req.workspace.title });
    }

    //     /**
    //      * Implementation for deleting a saved workspace in persistent storage.
    //      * @param id of the id of the workspace to delete.
    //      */
    public async deleteSavedWorkspace(id: string): Promise<void> {
      await api.store.workspaces.delete(id);
      return super.deleteSavedWorkspace(id)
    }

    //     /**
    //      * Implementation for getting a list of saved pages from persistent storage.
    //      * @param query an optional query.
    //      * @returns The list of pages.
    //      */
    public async getSavedPages(query?: string): Promise<Page[]> {
      const records = await this.loadData<Page>(api.store.pages);
      return records
    }

    //     /**
    //      * Implementation for creating a saved page in persistent storage.
    //      * @param req the create saved page request.
    //      */
    public async createSavedPage(req: CreateSavedPageRequest): Promise<void> {
      await api.store.pages.save(req.page.title, { ...req.page, pageId: req.page.title });
      return super.createSavedPage(req);
    }

    //     /**
    //      * Implementation for updating a saved page in persistent storage.
    //      * @param req the update saved page request.
    //      */
    public async updateSavedPage(req: UpdateSavedPageRequest): Promise<void> {
      await api.store.pages.save(req.page.title, { ...req.page, pageId: req.page.title });
      return super.updateSavedPage(req);
    }

    //     /**
    //      * Implementation for deleting a saved page in persistent storage.
    //      * @param id of the id of the page to delete.
    //      */
    public async deleteSavedPage(id: string): Promise<void> {
      return super.deleteSavedPage(id);
    }

    //     /**
    //      * Implementation for showing a global context menu given a menu template,
    //      * handler callback, and screen coordinates.
    //      * @param req the payload received by the provider call
    //      * @param callerIdentity OF identity of the entity from which the request originated
    //      * @returns Nothing.
    //      */
    public async openGlobalContextMenu(
      req: OpenGlobalContextMenuPayload,
      callerIdentity: OpenFin.Identity
    ): Promise<void> {
      // Map actions by action property
      const menuItems = req.template.filter((menuItem) => Boolean(menuItem.data?.type))
      const menuItemsMap = mapArray(menuItems, (menuItem) => menuItem.data?.type as GlobalContextMenuOptionType);
      const separator = {
        type: 'separator'
      };
      // Actions items with submenu don't have action property
      // so find required actions by label
      const switchWorkspaceAction = req.template.find(rec => rec.label === 'Switch Workspace')
      const deleteWorkspaceAction = req.template.find(rec => rec.label === 'Delete Workspace')

      // Create custom actions
      const newWindowAction = PlatformCustomActions.instance.getCustomActionConfig('Open New Window', CustomActionsIds.OpenNewWindow)

      const platform = getCurrentSync()
      const attachedPages = await platform.Browser.getAllAttachedPages()
      const pagesMap = mapArray(attachedPages, 'pageId');

      const pages = await (api.store.pages.get().catch(() => []))
      const pagesParsed: GlobalContextMenuItemTemplate[] = pages.map(({ name }) => ({
        label: name,
        checked: !!pagesMap.get(name)?.isActive,
        data: { type: GlobalContextMenuOptionType.Custom, action: { id: CustomActionsIds.OpenPage, customData: { name } } },
        enabled: !pagesMap.get(name),
        type: "checkbox"
      }))

      const template = [
        newWindowAction,
        {
          label: 'About Platform',
          data: { type: GlobalContextMenuOptionType.Custom, action: { id: CustomActionsIds.About, customData: {} } },
        },
        separator,
        {
          enabled: !!pagesParsed.length,
          label: 'Open Page',
          type: 'submenu',
          submenu: pagesParsed
        },
        menuItemsMap.get(GlobalContextMenuOptionType.NewPage),
        menuItemsMap.get(GlobalContextMenuOptionType.SavePage),
        menuItemsMap.get(GlobalContextMenuOptionType.SavePageAs),
        separator,
        switchWorkspaceAction,
        menuItemsMap.get(GlobalContextMenuOptionType.RestoreChanges),
        menuItemsMap.get(GlobalContextMenuOptionType.SaveWorkspace),
        menuItemsMap.get(GlobalContextMenuOptionType.SaveWorkspaceAs),
        deleteWorkspaceAction,
        separator,
        menuItemsMap.get(GlobalContextMenuOptionType.CloseWindow),
        ...(TokenManager.instance.preserveSession ? [{
          label: 'Sign Out',
          data: { type: GlobalContextMenuOptionType.Custom, action: { id: CustomActionsIds.SignOut, customData: {} } },
        }] : []),
        menuItemsMap.get(GlobalContextMenuOptionType.Quit),
      ].filter(Boolean) as GlobalContextMenuItemTemplate[];

      return super.openGlobalContextMenu(
        {
          ...req,
          template
        },
        callerIdentity
      )
    }
  }
  return new Override();
}
