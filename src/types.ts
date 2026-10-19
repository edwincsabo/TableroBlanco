export type Scene = { elements: readonly any[]; appState: Record<string, any>; files: Record<string, any> };
export type Board = { id:string; name:string; created:number; updated:number; favorite:boolean; deleted:boolean; isTemplate:boolean; thumbnail?:string; snapshotAt?:number; storageRevision?:string; scene:Scene };
export type SaveResult = {board:Board;conflict:boolean};
export type LibraryInfo = {path:string;defaultPath:string;custom:boolean;recoveryPath:string;lastBackup:string|null};
export type FolderProposal = {path:string;sourceCount:number;destinationCount:number;unchanged:boolean;token:string};
export type Snapshot = {id:string;date:number};
declare global {
  interface Window {
    EXCALIDRAW_ASSET_PATH: string;
    desktop?: {
      list():Promise<{boards:Board[];errors:string[]}>;
      save(board:Board):Promise<SaveResult>;
      remove(id:string,revision?:string):Promise<void>;
      history(id:string):Promise<Snapshot[]>;
      readHistory(id:string,version:string):Promise<Board>;
      snapshot(board:Board):Promise<void>;
      saveFile(options:{name:string;data:string|number[];kind:string}):Promise<boolean>;
      openFile():Promise<string|null>;
      dataFolder():Promise<void>;
      libraryInfo():Promise<LibraryInfo>;
      chooseFolder():Promise<FolderProposal|null>;
      changeFolder(token:string):Promise<LibraryInfo&{copied:number;conflicts:number}>;
      recoveryFolder():Promise<void>;
      onBoardsChanged(callback:()=>void):()=>void;
      external(url:string):Promise<void>;
      setLanguage(locale:'es'|'en'|'zh-CN'):Promise<void>;
      onClosing(callback:()=>void):()=>void;
      closeReady():Promise<void>;
      onOpen(callback:(data:string)=>void):()=>void;
    };
  }
}
