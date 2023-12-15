## Running the Sample

To run this sample you can:

- Clone this repo and follow the instructions below.

## Getting Started

1. Install all related projects and launch locally before OpenFin (OF).

   - Project with External Apps used in OF. [GitHub](https://github.com/BekAndriy/of-external-apps). According to [README.md](https://github.com/BekAndriy/of-external-apps/blob/main/README.md).

   - Files Storage Server. [GitHub](https://github.com/BekAndriy/of-server). According to [README.md](https://github.com/BekAndriy/of-server/blob/main/README.md).

   - OF Provider App. [GitHub](./provider/). According to [README.md](./provider//README.md).

2. Install dependencies and build the code.

```shell
npm install
```

2. Optional (if you wish to pin the version of OpenFin Workspace to version 15.0.0 and you are on Windows) - Set Windows registry key for [Desktop Owner Settings](https://developers.openfin.co/docs/desktop-owner-settings).
   This example runs a utility [dos.mjs](./scripts/dos.mjs) that adds the Windows registry key for you, pointing to a local desktop owner
   settings file so you can test these settings. If you already have a desktop owner settings file, this script prompts to overwrite the location. Be sure to capture the existing location so you can update the key when you are done using this example.

   (**WARNING**: This script kills all open OpenFin processes. **This is not something you should do in production to close apps as force killing processes could kill an application while it's trying to save state/perform an action**).

```shell
npm run dos
```

3. Start the test server in a new window. Note create `.env` before launching, example `.env.dev`

```shell
npm run start:dev
```
