#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");
const packageJson = require("./package.json");

const args = process.argv.slice(2);

const getFileSize = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInKB = fileSizeInBytes / 1024;
  const fileSizeInMB = fileSizeInKB / 1024;
  const fileSizeInGB = fileSizeInMB / 1024;

  if (fileSizeInGB >= 1) {
    return fileSizeInGB.toFixed(2) + " GB";
  } else if (fileSizeInMB >= 1) {
    return fileSizeInMB.toFixed(2) + " MB";
  } else {
    return fileSizeInKB.toFixed(2) + " KB";
  }
};

const extensionsFolder = path.join(os.homedir(), ".vscode", "extensions");

const getExtensionInfo = (folder) => {
  let extensionFolder = path.join(extensionsFolder, folder);
  const packageJsonPath = path.join(extensionFolder, "package.json");
  const stat = fs.statSync(extensionFolder);

  if (!stat.isDirectory()) {
    return null; // Skip if it's not a directory
  }

  try {
    const packageJsonData = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonData);

    const displayName = packageJson.displayName;
    const version = packageJson.version;
    const publisher = packageJson.publisher;
    const description = packageJson.description;
    const installationDate = fs.statSync(extensionFolder).ctime.toDateString();
    const extensionID = packageJson.publisher + "." + packageJson.name;
    const marketplaceURL = `https://marketplace.visualstudio.com/items?itemName=${extensionID}`;
    const size = getFileSize(extensionFolder);

    const repository = packageJson.repository && packageJson.repository.url;
    const keywords = packageJson.keywords && packageJson.keywords.join(", ");
    const license = packageJson.license;
    const dependencies = packageJson.dependencies;
    const engines = packageJson.engines;
    const vscodeVersion = engines && engines.vscode;
    const homepage = packageJson.homepage;
    const bugs = packageJson.bugs && packageJson.bugs.url;
    const author = packageJson.author;

    return {
      displayName,
      version,
      publisher,
      description,
      installationDate,
      extensionID,
      marketplaceURL,
      size,
      repository,
      keywords,
      license,
      dependencies,
      vscodeVersion,
      homepage,
      bugs,
      author,
    };
  } catch (error) {
    console.error(`Error reading package.json for ${extensionFolder}:`, error);
    return null;
  }
};

const showExtensionInfo = (extensionInfo, commands) => {
  if (!commands.includes("--name")) {
    console.log("Extension Name:", extensionInfo.displayName);
  }
  if (commands.includes("--name")) {
    console.log("Extension Name:", extensionInfo.displayName);
  }
  if (commands.includes("--author")) {
    console.log("Author Info:", JSON.stringify(extensionInfo.author, null, 2));
  }
  if (commands.includes("--ext-version")) {
    console.log("Extension Version:", extensionInfo.version);
  }
  if (commands.includes("--description")) {
    console.log("Description:", extensionInfo.description);
  }
  if (commands.includes("--date")) {
    console.log("Installation Date:", extensionInfo.installationDate);
  }
  if (commands.includes("--id")) {
    console.log("Extension ID:", extensionInfo.extensionID);
  }
  if (commands.includes("--url")) {
    console.log("Marketplace URL:", extensionInfo.marketplaceURL);
  }
  if (commands.includes("--size")) {
    console.log("Size:", extensionInfo.size);
  }
  if (commands.includes("--repo")) {
    console.log("Repository:", extensionInfo.repository);
  }
  if (commands.includes("--keywords")) {
    console.log("Keywords:", extensionInfo.keywords);
  }
  if (commands.includes("--license")) {
    console.log("License:", extensionInfo.license);
  }
  if (commands.includes("--deps")) {
    console.log(
      "Dependencies:",
      JSON.stringify(extensionInfo.dependencies, null, 2)
    );
  }

  if (commands.includes("--vscode-ver")) {
    console.log("VS Code Version:", extensionInfo.vscodeVersion);
  }
  if (commands.includes("--homepage")) {
    console.log("Homepage:", extensionInfo.homepage);
  }
  if (commands.includes("--bugs")) {
    console.log("Bugs:", extensionInfo.bugs);
  }
  if (commands.includes("--all")) {
    console.log("Extension Version:", extensionInfo.version);
    console.log("Publisher:", extensionInfo.publisher);
    console.log("Description:", extensionInfo.description);
    console.log("Installation Date:", extensionInfo.installationDate);
    console.log("Extension ID:", extensionInfo.extensionID);
    console.log("Marketplace URL:", extensionInfo.marketplaceURL);
    console.log("Size:", extensionInfo.size);
    console.log("Repository:", extensionInfo.repository);
    console.log("Keywords:", extensionInfo.keywords);
    console.log("License:", extensionInfo.license);
    console.log(
      "Dependencies:",
      JSON.stringify(extensionInfo.dependencies, null, 2)
    );
    console.log("VS Code Version:", extensionInfo.vscodeVersion);
    console.log("Homepage:", extensionInfo.homepage);
    console.log("Bugs:", extensionInfo.bugs);
    console.log("Author Info:", JSON.stringify(extensionInfo.author, null, 2));
  }
};

const showAllExtensionInfo = (commands) => {
  fs.readdir(extensionsFolder, (err, files) => {
    if (err) {
      console.error("Error reading extensions folder:", err);
      return;
    }

    files.forEach((folder, i) => {
      if (folder === "extensions.json") {
        return; // Skip the extensions.json folder
      }
      const extensionInfo = getExtensionInfo(folder);
      if (extensionInfo) {
        showExtensionInfo(extensionInfo, commands);
        if (i < files.length - 1) {
          console.log("_______________________________ \n");
        }
      }
    });
  });
};

const showTargetExtensionInfo = (extID, commands) => {
  let extensionID = extID.toLowerCase();
  fs.readdir(extensionsFolder, (err, files) => {
    if (err) {
      console.error("Error reading extensions folder:", err);
      return;
    }

    const matchingFolders = files.filter((folder) =>
      folder.startsWith(extensionID)
    );

    if (matchingFolders.length === 0) {
      console.log(`Extension with ID "${extensionID}" not found.`);
      return;
    }

    matchingFolders.forEach((folder) => {
      const extensionInfo = getExtensionInfo(folder);
      if (extensionInfo) {
        showExtensionInfo(extensionInfo, commands);
      }
    });
  });
};

const updateExtension = (extID) => {
  let command1;
  if (extID) {
    command1 = `code --install-extension ${extID} --force`;
    try {
      execSync(command1, { stdio: "inherit" });
      console.log(`Extension "${extID}" updated successfully.`);
    } catch (error) {
      console.error(`Failed to update extension "${extID}".`);
    }
  } else {
    fs.readdir(extensionsFolder, (err, files) => {
      if (err) {
        console.error("Error reading extensions folder:", err);
        return;
      }

      files.forEach((folder, i) => {
        if (folder === "extensions.json") {
          return; // Skip the extensions.json folder
        }
        const extensionInfo = getExtensionInfo(folder);
        if (extensionInfo) {
          command1 = `code --install-extension ${extensionInfo.extensionID} --force`;

          try {
            execSync(command1, { stdio: "inherit" });
            console.log(
              `Extension "${extensionInfo.extensionID}" updated successfully.`
            );
            if (i < files.length - 1) {
              console.log("_______________________________ \n");
            }
          } catch (error) {
            console.error(`Failed to update extension "${extID}".`);
          }
        }
      });
    });
  }
};

// Parse the command line arguments and execute corresponding functions

if (args.length === 0) {
  showAllExtensionInfo(args);
} else if (
  args.length === 1 &&
  !args[0].startsWith("--") &&
  !args[0].startsWith("-")
) {
  const extensionID = args[0];
  showTargetExtensionInfo(extensionID, args.slice(1));
} else {
  const validCommands = [
    "--name",
    "--ext-version",
    "--description",
    "--date",
    "--id",
    "--url",
    "--size",
    "--repo",
    "--keywords",
    "--license",
    "--deps",
    "--vscode-ver",
    "--homepage",
    "--bugs",
    "--all",
    "--help",
    "--author",
    "--update",
  ];

  const commands = args.filter((arg) => validCommands.includes(arg));
  const extensionIDIndex = args.findIndex(
    (arg) => arg[0] !== "-" && arg[1] !== "-"
  );
  const extensionID = args[extensionIDIndex];
  const notCommands = args.filter(
    (arg) => !validCommands.includes(arg) && arg !== extensionID
  );
  const showVersion = () => {
    console.log(`vscode-extension-info version: ${packageJson.version}`);
  };
  if (args.includes("--version") || args.includes("-v")) {
    showVersion();
    return;
  } else if (commands.includes("--update")) {
    if (extensionID) {
      updateExtension(extensionID);
    } else {
      updateExtension();
    }
  } else if (commands.includes("--help")) {
    console.log(
      "\nA Node.js package to retrieve information about Visual Studio Code extensions installed on the user's machine."
    );
    console.log(
      "\n\"You can use the shorthand command 'vs-ext-i' instead of 'vscode-extension-info' for convenience.\"\n"
    );

    console.log("  Usage:");
    console.log(
      "    • vs-ext-i <extension-id> [options]    Search and display information for a specific extension."
    );
    console.log(
      "    • vs-ext-i [options]                   Search and display information for all extensions."
    );

    console.log("\n  Options:");

    console.log("    --name           Display extension names");
    console.log("    --ext-version    Display extension versions");
    console.log("    --description    Display extension descriptions");
    console.log("    --date           Display installation dates");
    console.log("    --id             Display extension IDs");
    console.log("    --url            Display marketplace URLs");
    console.log("    --size           Display extension sizes");
    console.log("    --repo           Display extension repositories");
    console.log("    --keywords       Display extension keywords");
    console.log("    --license        Display extension licenses");
    console.log("    --deps           Display extension dependencies");
    console.log("    --vscode-ver     Display VS Code versions for extension");
    console.log("    --homepage       Display extension homepages");
    console.log("    --bugs           Display extension bug URLs");
    console.log("    --author         Display extension author info");
    console.log("    --all            Display all available data");
    console.log(
      "\n    --update         Update extension to the latest versions"
    );

    console.log(
      "\n    --version or -v  Display vscode-extension-info current version"
    );
  } else if (commands.length === 0 || notCommands.length) {
    console.log("Invalid command.");

    console.log("  Usage:");
    console.log(
      "    • vs-ext-i <extension-id> [options]    Search and display information for a specific extension."
    );
    console.log(
      "    • vs-ext-i [options]                   Search and display information for all extensions."
    );

    console.log("\n  Options:");

    console.log("    --name           Display extension names");
    console.log("    --ext-version    Display extension versions");
    console.log("    --description    Display extension descriptions");
    console.log("    --date           Display installation dates");
    console.log("    --id             Display extension IDs");
    console.log("    --url            Display marketplace URLs");
    console.log("    --size           Display extension sizes");
    console.log("    --repo           Display extension repositories");
    console.log("    --keywords       Display extension keywords");
    console.log("    --license        Display extension licenses");
    console.log("    --deps           Display extension dependencies");
    console.log("    --vscode-ver     Display VS Code versions for extension");
    console.log("    --homepage       Display extension homepages");
    console.log("    --bugs           Display extension bug URLs");
    console.log("    --author         Display extension author info");
    console.log("    --all            Display all available data");
    console.log(
      "\n    --update         Update extension to the latest versions"
    );
    console.log(
      "\n    --version or -v  Display vscode-extension-info current version"
    );
  } else if (extensionID) {
    showTargetExtensionInfo(extensionID, commands);
  } else if (args[0].startsWith("vs-ext-i")) {
    if (args.length === 1) {
      showAllExtensionInfo(args);
    } else {
      const extensionID = args[1];
      showTargetExtensionInfo(extensionID, args.slice(2));
    }
  } else {
    console.log("\n");
    showAllExtensionInfo(commands);
  }
}
