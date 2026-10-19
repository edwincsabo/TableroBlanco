# Synchronized folders and recovery

[Español](SINCRONIZACION.md) · **English** · [简体中文](SYNC.zh-CN.md)

Available in TableroBlanco 1.3.0 for Windows. Store your library in a folder synchronized by OneDrive, Google Drive or another desktop client. TableroBlanco works with local files; the provider transfers them to the cloud. You do not sign in inside TableroBlanco.

## Set up a folder

1. Install and configure your preferred sync client using your provider account.
2. Create a dedicated folder, such as `OneDrive\TableroBlanco` or a folder in your Google Drive.
3. Make the folder available offline. In OneDrive, use **Always keep on this device**. In Google Drive, use mirroring or make the folder available offline.
4. In the TableroBlanco library, open **Settings → Boards location → Change folder**.
5. Select the folder, check its path and board counts, then choose **Copy and use folder**.

The app creates a local backup, copies boards and their history and verifies the content before activating the location. Existing destination boards are kept. If an ID matches but the content differs, the incoming board is saved with a new ID and a name ending in **conflict copy**.

Source files are not deleted. After the change, only the new location receives saves; the previous folder remains a copy from the time of migration. Do not select a folder inside the current library or a folder that contains it. Do not use the local recovery folder as the destination.

## Continue on another computer

Install TableroBlanco and the sync client on the other computer. Wait for the library to download, make it available offline and select that folder in Settings. That computer's local boards are added to the destination while preserving both libraries.

Before switching computers, finish editing and check that the provider has finished syncing. **Saved in the folder** confirms a local write, not an upload. TableroBlanco does not show transfer status or the provider's storage quota.

## External changes and conflicts

The app checks file changes approximately every three seconds and when its window regains focus. The library refreshes automatically. An open canvas is not replaced by external content: a notice appears if its file changes or disappears.

Saving a stale revision puts your changes in a separate board. The version that arrived in the folder is kept, and both can be opened from the library. There is no automatic object merging or simultaneous collaboration. Provider-created conflict copies with different filenames are also shown as separate boards.

These checks reduce overwrite risks but are not a distributed lock and cannot guarantee resolution of every race between clients. Synchronization depends on the provider and connection. Avoid editing the same board on two computers at once and keep independent backups.

## Unavailable folders or unreadable files

If a configured folder disappears, the app warns you and does not silently switch to an empty library. Reconnect the drive or client and wait for the folder to become available. Unreadable files are preserved and listed in the notice; they are not automatically deleted or replaced.

If saving fails, the editor shows an error and lets you export an editable copy. If pending changes cannot be saved when closing, the window stays open. Reconnect an unavailable source or recover your copies before changing folders.

## Local recovery and independent backups

Open **Settings → Open local recovery**. This location stays in the Windows profile, outside the chosen library:

- `migraciones`: verified copies of boards and their history before changing folders. `origen.txt` records the source path.
- `estados`: the latest state submitted for saving and its predecessor, per board and location. These files are not a full history or a cloud backup.

To recover a board, choose **Import** and select its `.json` file; it opens as a copy with a new ID. To recover an entire library, import its boards or restore a JSON backup created with **Create a full backup**. Exported full backups do not include history snapshots.

Synchronization may also propagate deletions. Keep a backup independent of synchronized files, especially before updating, switching accounts or reorganizing folders.

## Limits and verification

The feature was tested with demonstration folders, simulated changes from another computer, conflicts, restarts and disconnections. The user's personal account was not used, and real transfers with every provider have not been certified. The client must support normal file reads and writes and have sufficient storage and permissions.

[Back to the English README](README.en.md)
