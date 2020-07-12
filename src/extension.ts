// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { UpdateOCCFileSettings } from './models/updateOCCFileSettings.module';
import { EEnvWindowsPf, EEnvIosPf, EEnvWindowsPj, EEnvIosPj, EOccEnv } from './extension.enum';

const occEnv = EOccEnv;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const workspace = vscode.workspace;
	// const fsPath = vscode.workspace.fs.readDirectory;
	// const accessToken = "vpvg447hj2wekyz4x3dhrqgkepangyzfsiczsrbqjqjipqlywb6a";
	// const OCCActionsTerminalName = "OCC actions";

	// let NEXT_TERM_ID = 1;

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.updateOCCFile', (item) => {
		const _workspace = vscode.workspace.workspaceFolders![0];
		workspace.findFiles(new vscode.RelativePattern(_workspace, "**/uofSettings.json"), "**/node_modules/**").then(results => {
			if (results[0]) {
				const jsonFile = results[0].fsPath;
				const data = fs.readFileSync(jsonFile);
				const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
				if (_workspace.name === settings.widgetName) {

					sendOCCFile(item, settings);

				} else {
					vscode.window.showErrorMessage(`Você está no workspace "${_workspace.name}". O workspace selecionado no VSCode precisa ser o diretório do widget "${settings.widgetName}" definido no arquivo "uofSettings.json".`);
				}
			}
		});
	});

	let getOCCWidget = vscode.commands.registerCommand('extension.getOCCWidget', (item) => {
		const _workspace = vscode.workspace.workspaceFolders![0];
		workspace.findFiles(new vscode.RelativePattern(_workspace, "**/uofSettings.json"), "**/node_modules/**").then(results => {
			if (results[0]) {
				const jsonFile = results[0].fsPath;
				const data = fs.readFileSync(jsonFile);
				const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
				if (_workspace.name === settings.widgetName) {

					if (settings.environment && settings.environment !== '') {
						if (settings.platform) {
							const terminal = vscode.window.activeTerminal;
							if (settings.OCCRootPath) {
								const apiAccessKey = validateEnvironmentPropertyApiKey(settings.environment.toLowerCase(), settings.platform.toLowerCase());
								const node = validateEnvironmentPropertyNode(settings.environment.toLowerCase(), settings.platform.toLowerCase());
								vscode.window.showInformationMessage(`Executando download do widget "${_workspace.name}".`);

								terminal?.sendText(`prompt $P [$T$H$H$H]$G`);
								terminal?.sendText(`cd ${settings.OCCRootPath} && dcu -n ${node} -k ${apiAccessKey} -e "widget/${_workspace.name}" & prompt $P$G && cd "${_workspace.uri.fsPath}"`);
							} else { vscode.window.showErrorMessage(`É preciso informar o caminho(path) da pasta raiz do OCC para download do widget "${_workspace.name}" na propriedade "OCCRootPath" do arquivo "uofSettings.json".`); }
						} else { vscode.window.showErrorMessage(`É preciso informar a plataforma na propriedade "platform" no arquivo "uofSettings.json"!`); }
					} else { vscode.window.showErrorMessage(`Erro na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
				} else { vscode.window.showErrorMessage(`Você está no workspace "${_workspace.name}". O workspace selecionado no VSCode precisa ser o diretório do widget "${settings.widgetName}" definido no arquivo "uofSettings.json".`); }
			}
		});

	});

	let runGrab = vscode.commands.registerCommand('extension.runGrab', (item) => {
		const _workspace = vscode.workspace.workspaceFolders![0];
		workspace.findFiles(new vscode.RelativePattern(_workspace, "**/uofSettings.json"), "**/node_modules/**").then(results => {
			if (results[0]) {
				const jsonFile = results[0].fsPath;
				const data = fs.readFileSync(jsonFile);
				const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
				if (_workspace.name === settings.widgetName) {

					if (settings.environment && settings.environment !== '') {
						if (settings.platform) {
							const terminal = vscode.window.activeTerminal;
							if (settings.OCCRootPath) {
								const apiAccessKey = validateEnvironmentPropertyApiKey(settings.environment.toLowerCase(), settings.platform.toLowerCase());
								const node = validateEnvironmentPropertyNode(settings.environment.toLowerCase(), settings.platform.toLowerCase());
								vscode.window.showInformationMessage(`Executando download dos widgets.`);

								terminal?.sendText(`prompt $P [$T$H$H$H]$G`);
								terminal?.sendText(`cd ${settings.OCCRootPath} && dcu -n ${node} -k ${apiAccessKey} -g & prompt $P$G && cd "${_workspace.uri.fsPath}"`);

							} else { vscode.window.showErrorMessage(`É preciso informar o caminho(path) da pasta raiz do OCC para download do widget "${_workspace.name}" na propriedade "OCCRootPath" do arquivo "uofSettings.json".`); }
						} else { vscode.window.showErrorMessage(`É preciso informar a plataforma na propriedade "platform" no arquivo "uofSettings.json"!`); }
					} else { vscode.window.showErrorMessage(`Erro na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
				} else { vscode.window.showErrorMessage(`Você está no workspace "${_workspace.name}". O workspace selecionado no VSCode precisa ser o diretório do widget "${settings.widgetName}" definido no arquivo "uofSettings.json".`); }
			}
		});

	});

	let uofPrepare = vscode.commands.registerCommand('extension.uofPrepare', (item) => {
		const _workspace = vscode.workspace.workspaceFolders![0];
		const fsPath = _workspace.uri.fsPath;
		const wsedit = new vscode.WorkspaceEdit();
		const filePath = vscode.Uri.file(fsPath + '/uofSettings.json');
		const value = {
			"environment": "dev-pf",
			"widgetName": _workspace.name,
			"OCCRootPath": "c:/development/OCC",
			"platform": "windows"
		};
		const textEdit = new vscode.TextEdit(new vscode.Range(1, 1, 1, 1), JSON.stringify(value));
		wsedit.createFile(filePath, { ignoreIfExists: true, overwrite: true });
		wsedit.set(filePath, [textEdit]);
		vscode.workspace.applyEdit(wsedit);
		vscode.window.showInformationMessage('Arquivo "uofSettings.json" criado!');
	});

	/* Caso precise que seja salvo enviado ao salvar o arquivo. */
	context.subscriptions.push(disposable);
	context.subscriptions.push(uofPrepare);
	context.subscriptions.push(getOCCWidget);
	context.subscriptions.push(workspace.onDidSaveTextDocument((td) => {
		const fileName = td.fileName;
		const terminal = vscode.window.activeTerminal;
		const _workspace = vscode.workspace.workspaceFolders![0];

		workspace.findFiles(new vscode.RelativePattern(_workspace, "**/uofSettings.json"), "**/node_modules/**").then(results => {
			if (results[0]) {
				const jsonFile = results[0].fsPath;
				const data = fs.readFileSync(jsonFile);
				const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
				if (_workspace.name === settings.widgetName) {
					if (settings.environment && settings.environment !== '') {
						if (settings.platform) {
							const fileName = td.fileName;
							const terminal = vscode.window.activeTerminal;

							const apiAccessKey = validateEnvironmentPropertyApiKey(settings.environment.toLowerCase(), settings.platform.toLowerCase());
							const node = validateEnvironmentPropertyNode(settings.environment.toLowerCase(), settings.platform.toLowerCase());
							const time = `echo [${new Date().getHours()}:${new Date().getMinutes()}]`;

							if (validateEnvData(settings.environment.toLowerCase())) {
								if (settings.environment.toLowerCase().indexOf('-pj') > -1) {
									// const x = fileName.split(`teste-ocd\\`);
									// const y = settings.
									
									let q = x.join('teste-ocd\\.ccc\\');
                  console.log('TCL Bonny: activate -> x', q);
								}
								vscode.window.showInformationMessage(`Enviando arquivo "${fileName}"`);
								terminal?.sendText(`prompt $P [$T$H$H$H]$G`);
								terminal?.sendText(`dcu -n ${node} -k ${apiAccessKey} -t "${fileName}" & prompt $P$G`);
							} else { vscode.window.showErrorMessage(`Valor incorreto na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
						} else { vscode.window.showErrorMessage(`É preciso informar a plataforma na propriedade "platform" no arquivo "uofSettings.json"!`); }
					} else { vscode.window.showErrorMessage(`Erro na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
				} else { vscode.window.showErrorMessage(`O worspace selecionado no VSCode precisa ser o diretório do widget \`${settings.widgetName}\``); }
			}
		});
	}));

}

/**
 * Valida as informações na propriedade `environment`.
 * @param envData Dado informado na propriedade `environment`.
 */
function validateEnvData(envData: string) {
	return envData === occEnv.devPf || envData === occEnv.uatPf || envData === occEnv.prdPf || envData === occEnv.devPj || envData === occEnv.uatPj || envData === occEnv.prdPj;
}

/**
 * Envia um arquivo para o OCC.
 * @param item Arquivo a ser enviado;
 * @param settings Configurações UOF do widget.
 */
function sendOCCFile(item: any, settings: UpdateOCCFileSettings) {
	if (settings.environment && settings.environment !== '') {
		if (settings.platform) {
			const apiAccessKey = validateEnvironmentPropertyApiKey(settings.environment.toLowerCase(), settings.platform.toLowerCase());
			const node = validateEnvironmentPropertyNode(settings.environment.toLowerCase(), settings.platform.toLowerCase());

			const fileName = item.fsPath;
			const terminal = vscode.window.activeTerminal;
			const time = `echo [${new Date().getHours()}:${new Date().getMinutes()}]`;

			if (validateEnvData(settings.environment.toLowerCase())) {

				console.log('TCL Bonny: activate -> time', time);
				vscode.window.showInformationMessage(`Enviando arquivo "${fileName}"`);
				terminal?.sendText(`prompt $P [$T$H$H$H]$G`);
				terminal?.sendText(`dcu -n ${node} -k ${apiAccessKey} -t "${fileName}" & prompt $P$G`);
			} else { vscode.window.showErrorMessage(`Valor incorreto na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
		} else { vscode.window.showErrorMessage(`É preciso informar a plataforma na propriedade "platform" no arquivo "uofSettings.json"!`); }
	} else { vscode.window.showErrorMessage(`Erro na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
}

/**
 * Verifica o ambiente e retorna a variável de ambiente para API Key.
 * @param environment Embiante de desenvolvimento.
 */
function validateEnvironmentPropertyApiKey(environment: string, platform: string) {
	if (environment.indexOf('-pj') > -1) {
		const env = platform === 'windows' ? EEnvWindowsPj : EEnvIosPj;
		return environment === occEnv.prdPj ? env.prodApiKey : environment === occEnv.uatPj ? env.uatApiKey : environment === occEnv.devPj ? env.devApiKey : 'error';
	}
	else {
		const env = platform === 'windows' ? EEnvWindowsPf : EEnvIosPf;
		return environment === occEnv.prdPf ? env.prodApiKey : environment === occEnv.uatPf ? env.uatApiKey : environment === occEnv.devPf ? env.devApiKey : 'error';
	}
}

/**
 * Verifica o ambiente e retorna a variável de ambiente para o nó desejado.
 * @param environment Embiante de desenvolvimento.
 */
function validateEnvironmentPropertyNode(environment: string, platform: string) {
	if (environment.indexOf('-pj') > -1) {
		const env = platform === 'windows' ? EEnvWindowsPj : EEnvIosPj;
		return environment === occEnv.prdPj ? env.prodNode : environment === occEnv.uatPj ? env.uatNode : environment === occEnv.devPj ? env.devNode : 'error';
	}
	else {
		const env = platform === 'windows' ? EEnvWindowsPf : EEnvIosPf;
		return environment === occEnv.prdPf ? env.prodNode : environment === occEnv.uatPf ? env.uatNode : environment === occEnv.devPf ? env.devNode : 'error';
	}
}

function getWebviewContent(cat: keyof typeof cats) {
	return `<webview>
	<iframe src="https://www.w3schools.com" width="100%" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin"></iframe></webview>`;
}

// this method is called when your extension is deactivated
export function deactivate() { }
