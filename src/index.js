const fs = require("fs");

const { execSync } = require("child_process");

const path = require("path");

const axios = require("axios");

const cheerio = require("cheerio");

const sharp = require("sharp");

async function downloadIcon(url, outputPath) {
  try {
    const response = await axios.get(url);

    const html = response.data;

    //   console.log('HTML Descargado:', html);

    const $ = cheerio.load(html);

    const iconLink = $('link[rel="icon"]');

    const shortcutIconLink = $('link[rel="shortcut icon"]');

    let iconHref;

    if (iconLink.length > 0) {
      iconHref = iconLink.attr("href");
    } else if (shortcutIconLink.length > 0) {
      iconHref = shortcutIconLink.attr("href");
    } else {
      throw new Error("No se encontró un enlace de icono en la página.");
    }

    const iconUrl = new URL(iconHref, url).href;

    // Descargar el icono

    const iconResponse = await axios.get(iconUrl, {
      responseType: "arraybuffer",
    });

    const fileExtension = outputPath.split(".").pop().toLowerCase();

    let convertedOutputPath;

    if (fileExtension === "svg") {
      convertedOutputPath = outputPath.replace(".svg", ".png");

      await sharp(Buffer.from(iconResponse.data)).toFile(convertedOutputPath);
    } else if (fileExtension === "ico") {
      convertedOutputPath = outputPath.replace(".ico", ".png");

      await sharp(Buffer.from(iconResponse.data), { density: 300 })
        .resize(256, 256)
        .png()
        .toFile(convertedOutputPath);
    } else {
      throw new Error("Formato de archivo no compatible. Se espera SVG o ICO.");
    }

    console.log(
      "Icono convertido y guardado exitosamente como PNG:",
      convertedOutputPath
    );

    return convertedOutputPath;
  } catch (error) {
    console.error("Error al descargar o convertir el icono:", error.message);

    return null;
  }
}

const webtodesktop = async (userUrl, outputDir, isDev, myIcon) => {
  console.log("Creating...");

  const packageName = userUrl.replace(/[^a-zA-Z0-9-]/g, "");

  const url =
    userUrl || "https://www.google.com/".replace(/[^a-zA-Z0-9-]/g, "");

  console.log(outputDir);

  // Crear directorios necesarios

  const outputDirPath = path.join(outputDir, "source");

  fs.mkdirSync(outputDirPath, { recursive: true });

  // Descargar y convertir el icono

  const outputPath = path.join(outputDirPath, "icono.ico");

  const convertedIconPath = await downloadIcon(url, outputPath);

  if (!convertedIconPath) {
    console.log(
      "Error al descargar o convertir el icono. La aplicación no se creará."
    );

    return;
  }

  // Crear package.json

  const packageJson = {
    name: packageName,

    version: "1.0.0",

    main: "index.js",

    scripts: {
      start: "electron index.js",

      build: "electron-builder",
    },

    devDependencies: {
      electron: "^28.1.4",

      "electron-builder": "^24.9.1",
    },

    build: {
      productName: `${userUrl}`,

      appId: url,

      win: {
        target: "nsis",

        icon: `${myIcon == true ? myIcon : "icono.png"}`,
      },
    },
  };

  fs.writeFileSync(
    `${outputDirPath}/package.json`,

    JSON.stringify(packageJson, null, 2)
  );

  // Instalar dependencias

  execSync("npm install", { cwd: outputDirPath });

  // Crear index.js

  const indexJs = `

const { app, BrowserWindow, Menu } = require('electron');



function createWindow() {

  const win = new BrowserWindow({

    width: 800,

    height: 600,

    webPreferences: {

      nodeIntegration: true,

      devTools: ${isDev == true ? true : false}

    }

  });

  Menu.setApplicationMenu(null);

  win.loadURL('${url}');

}



app.whenReady().then(createWindow);



app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {

    app.quit();

  }

});



app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {

    createWindow();

  }

});

  `;

  fs.writeFileSync(`${outputDirPath}/index.js`, indexJs);

  // Ejecutar electron-builder

  execSync("npm run build", { cwd: outputDirPath });

  // Mover la carpeta dist fuera de source

  fs.renameSync(`${outputDirPath}/dist`, path.join(outputDir, "dist"));

  // Ejecutar la aplicación

  execSync("npm start", { cwd: outputDirPath });

  console.log("Proyecto creado exitosamente.");

  console.log(`Directorio del proyecto: ${outputDirPath}`);
};

const webtodesktopLinux = async (userUrl, outputDir, isDev, type) => {
  console.log("Creating...");

  const packageName = userUrl.replace(/[^a-zA-Z0-9-]/g, "");

  const url =
    userUrl || "https://www.google.com/".replace(/[^a-zA-Z0-9-]/g, "");

  console.log(outputDir);

  // Crear directorios necesarios

  const outputDirPath = path.join(outputDir, "source");

  fs.mkdirSync(outputDirPath, { recursive: true });

  // Descargar y convertir el icono

  const outputPath = path.join(outputDirPath, "icono.ico");

  const convertedIconPath = await downloadIcon(url, outputPath);

  if (!convertedIconPath) {
    console.log(
      "Error al descargar o convertir el icono. La aplicación no se creará."
    );

    return;
  }

  let typeLinux = "AppImage";

  // Crear package.json

  const packageJson = {
    name: packageName,

    version: "1.0.0",

    main: "index.js",

    scripts: {
      start: "electron index.js",

      build: "electron-builder",
    },

    devDependencies: {
      electron: "^28.1.4",

      "electron-builder": "^24.9.1",
    },

    build: {
      productName: `${userUrl}`,

      appId: url,

      linux: {
        target: `${type == "AppImage" ? "AppImage" : "snap"}`,

        icon: `icono.png`,

        snap: {
          grade: "stable",

          confinement: "strict",
        },
      },
    },
  };

  fs.writeFileSync(
    `${outputDirPath}/package.json`,

    JSON.stringify(packageJson, null, 2)
  );

  // Instalar dependencias

  execSync("npm install", { cwd: outputDirPath });

  // Crear index.js

  const indexJs = `

const { app, BrowserWindow, Menu } = require('electron');



function createWindow() {

  const win = new BrowserWindow({

    width: 800,

    height: 600,

    webPreferences: {

      nodeIntegration: true,

      devTools: ${isDev == true ? true : false}

    }

  });

  Menu.setApplicationMenu(null);

  win.loadURL('${url}');

}



app.whenReady().then(createWindow);



app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {

    app.quit();

  }

});



app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {

    createWindow();

  }

});

  `;

  fs.writeFileSync(`${outputDirPath}/index.js`, indexJs);

  // Ejecutar electron-builder

  execSync("npm run build", { cwd: outputDirPath });

  // Mover la carpeta dist fuera de source

  fs.renameSync(`${outputDirPath}/dist`, path.join(outputDir, "dist"));

  // Ejecutar la aplicación

  execSync("npm start", { cwd: outputDirPath });

  console.log("Proyecto creado exitosamente.");

  console.log(`Directorio del proyecto: ${outputDirPath}`);
};

const webtodesktopMac = async (userUrl, outputDir, isDev) => {
  console.log("Creating...");

  const packageName = userUrl.replace(/[^a-zA-Z0-9-]/g, "");

  const url = userUrl || "https://www.google.com/".replace(/[^a-zA-Z0-9-]/g, "");

  console.log(outputDir);

  
  const outputDirPath = path.join(outputDir, "source");
  fs.mkdirSync(outputDirPath, { recursive: true });

  
  const outputPath = path.join(outputDirPath, "icono.png"); 
  const convertedIconPath = await downloadIcon(url, outputPath);

  if (!convertedIconPath) {
    console.log(
      "Error al descargar o convertir el icono. La aplicación no se creará."
    );
    return;
  }

  // Crear package.json
  const packageJson = {
    name: packageName,
    version: "1.0.0",
    main: "index.js",
    scripts: {
      start: "electron index.js",
      build: "electron-builder",
    },
    devDependencies: {
      electron: "^28.1.4",
      "electron-builder": "^24.9.1",
    },
    build: {
      productName: `${userUrl}`,
      appId: url,
      mac: {
        target: "dmg",
        icon: `icono.png`,
      },
    },
  };

  fs.writeFileSync(
    `${outputDirPath}/package.json`,
    JSON.stringify(packageJson, null, 2)
  );

  // Instalar dependencias
  execSync("npm install", { cwd: outputDirPath });

  // Crear index.js
  const indexJs = `
    const { app, BrowserWindow, Menu } = require('electron');
    function createWindow() {
      const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          devTools: ${isDev == true ? true : false}
        }
      });
      Menu.setApplicationMenu(null);
      win.loadURL('${url}');
    }
    app.whenReady().then(createWindow);
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  `;

  fs.writeFileSync(`${outputDirPath}/index.js`, indexJs);

  // Ejecutar electron-builder
  execSync("npm run build", { cwd: outputDirPath });

  // Mover la carpeta dist fuera de source
  fs.renameSync(`${outputDirPath}/dist`, path.join(outputDir, "dist"));

  // Ejecutar la aplicación
  execSync("npm start", { cwd: outputDirPath });

  console.log("Proyecto creado exitosamente.");
  console.log(`Directorio del proyecto: ${outputDirPath}`);
};


module.exports = {
  webtodesktop,
  webtodesktopLinux,
  webtodesktopMac
};
