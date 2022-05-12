// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { UpdateOCCFileSettings } from './models/updateOCCFileSettings.module';
import { EOccAlias, EPlatform } from './extension.enum';
import { settings } from 'cluster';
import * as os from 'os';
// import childProcess = require('child_process');

const occAlias = EOccAlias;
const userPlatform = os.platform() === 'darwin' ? EPlatform.macOS : EPlatform.windows;
const uofSettingPath = os.platform() === 'darwin' ? '\\uofSettings.json' : '/uofSettings.json';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const workspace = vscode.workspace;
	// const fsPath = vscode.workspace.fs.readDirectory;
	// const accessToken = "vpvg447hj2wekyz4x3dhrqgkepangyzfsiczsrbqjqjipqlywb6a";

	// let NEXT_TERM_ID = 1;

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let sendFile = vscode.commands.registerCommand('extension.sendFile', (item) => {
		const _workspace = vscode.workspace.workspaceFolders![0];
		const data = fs.readFileSync(_workspace.uri.fsPath + uofSettingPath);
		const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
		if (settings) {
			sendOCCFile(item, settings, _workspace);
		}
	});

	let refreshWidget = vscode.commands.registerCommand('extension.refreshWidget', (item) => {
		const fsPath: string = item?.fsPath;
		gradOrRefreshWidget(fsPath, 'e');
	});

	let grabWidget = vscode.commands.registerCommand('extension.grabWidget', (item) => {
		const fsPath: string = item?.fsPath;
		gradOrRefreshWidget(fsPath, 'g');
	});

	let runGrab = vscode.commands.registerCommand('extension.runGrab', (item) => {
		const _workspace = vscode.workspace.workspaceFolders![0];
		const data = fs.readFileSync(_workspace.uri.fsPath + uofSettingPath);
		const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
		if (settings && checkEnvironment(settings.environmentPrefix) && checkPlatform(userPlatform) && checkRootOccPath(settings.OCCRootPath, _workspace.name)) {
			const terminal = getActiveOccTerminal();
			const prefixCommand = mountPrefixCommand(settings.environmentPrefix, userPlatform, occAlias.dcu);

			if (prefixCommand) {
				vscode.window.showInformationMessage(`Executando download dos widgets.`);
				terminal?.show(true);
				terminal?.sendText(`${prefixCommand} -b ${settings.OCCRootPath} -g`);
			}
		}
	});

	let createWidget = vscode.commands.registerCommand('extension.createWidget', (item) => {
		const _workspace = vscode.workspace.workspaceFolders![0];
		const data = fs.readFileSync(_workspace.uri.fsPath + uofSettingPath);
		const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
		if (settings && checkEnvironment(settings.environmentPrefix) && checkPlatform(userPlatform) && checkRootOccPath(settings.OCCRootPath, _workspace.name)) {
			const terminal = getActiveOccTerminal();
			const prefixCommand = mountPrefixCommand(settings.environmentPrefix, userPlatform, occAlias.ccw);

			if (prefixCommand) {
				terminal?.show(true);
				terminal?.sendText(`${prefixCommand} -b ${settings.OCCRootPath} -w`);
			}
		}
	});

	let uofPrepare = vscode.commands.registerCommand('extension.uofPrepare', (item) => {
		const _workspace = vscode.workspace.workspaceFolders![0];
		const fsPath = _workspace.uri.fsPath;
		const wsedit = new vscode.WorkspaceEdit();
		const filePath = vscode.Uri.file(fsPath + uofSettingPath);
		const value = {
			"environmentPrefix": "",
			"OCCRootPath": ""
		};
		const textEdit = new vscode.TextEdit(new vscode.Range(1, 1, 1, 1), JSON.stringify(value));
		wsedit.createFile(filePath, { ignoreIfExists: true, overwrite: true });
		wsedit.set(filePath, [textEdit]);
		vscode.workspace.applyEdit(wsedit);
		vscode.window.showInformationMessage('Arquivo "uofSettings.json" criado!');
	});

	context.subscriptions.push(sendFile);
	context.subscriptions.push(uofPrepare);
	context.subscriptions.push(refreshWidget);
	context.subscriptions.push(grabWidget);
	context.subscriptions.push(createWidget);
	context.subscriptions.push(runGrab);

	/* Caso precise que seja enviado ao salvar o arquivo. */
	context.subscriptions.push(workspace.onDidSaveTextDocument((td) => {
		const fileName = td.fileName;
		const terminal = getActiveOccTerminal();
		const _workspace = vscode.workspace.workspaceFolders![0];
		const data = fs.readFileSync(_workspace.uri.fsPath + uofSettingPath);
		const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
		if (settings && checkEnvironment(settings.environmentPrefix) && checkPlatform(userPlatform)) {
			const prefixCommand = mountPrefixCommand(settings.environmentPrefix, userPlatform, occAlias.dcu);
			checkGitignore(_workspace, fileName).then((r) => {
				if (prefixCommand) {
					vscode.window.showInformationMessage(`Enviando arquivo "${fileName}"`);
					terminal?.show(true);
					terminal?.sendText(`${prefixCommand} -t "${fileName}"`);
				}
			}).catch(e => {

			});
		}
	}));

}

/**
 * Checa se o arquivo que vai ser salvo deve ser ignorado pelos arquivos informados no `.gitignore`.
 * @param gitignoreList Lista de arquivos a serem ignorados em Array.
 * @param filePath Path do arquivo a ser validado.
 */
function checkGitignore(_workspace: vscode.WorkspaceFolder, filePath: string): Promise<boolean> {
	const filePathSlash = filePath.replace(/\\/g, '/');
	return new Promise((resolv, reject) => {
		try {
			const workspace = vscode.workspace;
			workspace.findFiles(new vscode.RelativePattern(_workspace, "**/.gitignore"), "**/node_modules/**").then(gitignoreFiles => {
				if (gitignoreFiles.length > 0) {
					gitignoreFiles.forEach((result: any, indexForGitignoreFiles: number) => {
						const jsonFile: string = result.fsPath;
						const gitignoreList = fs.readFileSync(jsonFile).toString().split(/\n|\r/);
						const absoluteGitignorePath = jsonFile.replace('.gitignore', '').replace(/\\/g, '/').replace(/\/\//g, '/');
						gitignoreList.forEach((gitignoreFileName: string, indexForGitignoreList: number) => {
							if (gitignoreFileName && gitignoreFileName !== '') {
								const fileToBeIgnored = (absoluteGitignorePath + gitignoreFileName).replace(/\\/g, '/');
								if (filePathSlash.indexOf('uofSettings') > -1 || filePathSlash.indexOf('gitignore') > -1 || filePathSlash.indexOf(fileToBeIgnored) > -1) {
									reject(false);
								} else if ((indexForGitignoreList + 1) === gitignoreList.length && (indexForGitignoreFiles + 1) === gitignoreFiles.length) {
									resolv(true);
								}
							} else if ((indexForGitignoreList + 1) === gitignoreList.length && (indexForGitignoreFiles + 1) === gitignoreFiles.length) {
								resolv(true);
							}
						});
					});
				} else if (gitignoreFiles.length === 0) {
					if (filePathSlash.indexOf('uofSettings') > -1 || filePathSlash.indexOf('gitignore') > -1) {
						reject(false);
					} else {
						resolv(true);
					}
				}
			}, error => {

			});
		} catch (err) {
			if (err.toString().indexOf('no such file or directory, open') > -1) {
				resolv(true);
			} else {
				vscode.window.showErrorMessage('UOF - error: ' + err);
			}
		}
	});

}

/**
 * Verifica se a pasta raiz do ambiente foi informada no arquivo `uofSettings.json`.
 * @param OCCRootPath Pasta raiz do ambiente OCC.
 * @param workspaceName Nome do workspace.
 * @returns {boolean} `true` = se a pasta raiz foi informada || `false` se não foi informada.
 */
function checkRootOccPath(OCCRootPath: string, workspaceName: string): boolean {
	const vscWindow = vscode.window;
	if (OCCRootPath && OCCRootPath !== '') { return true; }
	else {
		vscWindow.showErrorMessage(`O comando UOF não foi executado! Informe o path base do OCC na propriedade "OCCRootPath" do arquivo "uofSettings.json".`);
		return false;
	}
}

/**
 * Verifica se a plataforma foi informada no arquivo `uofSettings.json`.
 * @param platform Plataforma sendo utilizada.
 * @returns {boolean} `true` = se a plataforma foi informada || `false` se não foi informada.
 */
function checkPlatform(platform: string): boolean {
	const vscWindow = vscode.window;
	if (platform && platform !== '') { return true; }
	else {
		vscWindow.showErrorMessage(`É preciso informar a plataforma na propriedade "platform" no arquivo "uofSettings.json"!`);
		return false;
	}
}

/**
 * Verifica se o ambiente foi informada no arquivo `uofSettings.json`.
 * @param environment Ambiente OCC.
 * @returns {boolean} `true` = se o ambiente foi informada || `false` se não foi informada.
 */
function checkEnvironment(environment: string): boolean {
	const vscWindow = vscode.window;
	if (environment && environment !== '') { return true; }
	else {
		vscWindow.showErrorMessage(`Erro na propriedade "environmentPrefix" no arquivo "uofSettings.json"! Favor revisar.`);
		return false;
	}
}

/**
 * Envia um arquivo para o OCC.
 * @param item Arquivo a ser enviado;
 * @param settings Configurações UOF do widget.
 * @param _workspace WorkspaceFolder.
 */
function sendOCCFile(item: any, settings: UpdateOCCFileSettings, _workspace: vscode.WorkspaceFolder) {
	if (item && item.fsPath) {
		if (checkEnvironment(settings.environmentPrefix) && checkPlatform(userPlatform)) {
			const prefixCommand = mountPrefixCommand(settings.environmentPrefix, userPlatform, occAlias.dcu);

			if (prefixCommand) {
				const fileName = item.fsPath;
				const terminal = getActiveOccTerminal();

				checkGitignore(_workspace, fileName).then(() => {
					vscode.window.showInformationMessage(`Enviando arquivo "${fileName}"`);
					terminal?.show(true);
					terminal?.sendText(`${prefixCommand} -t "${fileName}"`);
				});
			}
		}
	} else {
		vscode.window.showWarningMessage('O comando "UOF Send File" não foi executado. Clique com o botão direito em um dos arquivos da instância e selecione o comando!');
	}
}

/**
 * Monta a base do comando DCU com a API Key e o nó do ambiente.
 * @param environment Ambiente de desenvolvimento.
 * @param platform Plataforma Windows ou iOS.
 */
function mountPrefixCommand(environment: string, platform: string, context?: string) {
	const env = environment.toUpperCase().replace('-', '_');
	const platf = platform.toLowerCase();
	const apiAccessKey = validateEnvironmentPropertyApiKey(env, platf);
	const node = validateEnvironmentPropertyNode(env, platf);
	return `${context === occAlias.ccw ? occAlias.ccw : occAlias.dcu} -k ${apiAccessKey} -n ${node}`;
}

/**
 * Verifica o ambiente e retorna a variável de ambiente para API Key.
 * @param environment Ambiente de desenvolvimento.
 * @param platform Plataforma Windows ou iOS.
 */
function validateEnvironmentPropertyApiKey(environment: string, platform: string) {
	const apiKeySuffix = '_API_KEY';
	const env = platform === 'windows' ? `%${environment}${apiKeySuffix}%` : `$${environment}${apiKeySuffix}`;
	return env;

}

/**
 * Verifica o ambiente e retorna a variável de ambiente para o nó desejado.
 * @param environment Ambiente de desenvolvimento.
 * @param platform Plataforma Windows ou iOS.
 */
function validateEnvironmentPropertyNode(environment: string, platform: string) {
	const nodeSuffix = '_NODE';
	const env = platform === 'windows' ? `%${environment}${nodeSuffix}%` : `$${environment}${nodeSuffix}`;
	return env;
}

/**
 * Cria um novo terminal ou recupera o terminal OCC já ativo.
 * @returns vscode.Terminal
 */
function getActiveOccTerminal(): vscode.Terminal {
	const occActionsTerminalName = "OCC actions";
	let occActiveTerminal = vscode.window.terminals.find((activeTerm) => {
		return activeTerm.name === occActionsTerminalName ? activeTerm : false;
	});
	if (occActiveTerminal?.creationOptions.name === occActionsTerminalName) {
		return occActiveTerminal;
	} else { return vscode.window.createTerminal(occActionsTerminalName); }
}

/**
 * Executa as validações para os comandos de `refreshWidget` e `grabWidget`.
 * @param fsPath Caminho do arquivo.
 * @param context Contexto do comando - `e` para --refresh | `g` para grab.  
 */
function gradOrRefreshWidget(fsPath: string, context: string) {
	let widgetName: string | undefined;

	if (fsPath) {
		if (fsPath.lastIndexOf('\\widget\\') > -1 || fsPath.lastIndexOf('/widget/') > -1) {
			const _workspace = vscode.workspace.workspaceFolders![0];
			const data = fs.readFileSync(_workspace.uri.fsPath + uofSettingPath);
			const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
			const widgetPathLocation = userPlatform === EPlatform.windows ? '\\widget\\' : '/widget/';
			widgetName = fsPath.substring(fsPath.lastIndexOf(widgetPathLocation) + 8, fsPath.length);

			if (widgetName.indexOf('\\') > -1 || widgetName.indexOf('/') > -1) {
				widgetName = undefined;
			}
			if (checkEnvironment(settings.environmentPrefix) && checkPlatform(userPlatform) && checkRootOccPath(settings.OCCRootPath, _workspace.name)) {
				const terminal = getActiveOccTerminal();

				const prefixCommand = mountPrefixCommand(settings.environmentPrefix, userPlatform, occAlias.dcu);
				if (prefixCommand) {
					if (widgetName) {
						vscode.window.showInformationMessage(`Executando download do widget "${widgetName ? widgetName : _workspace.name}".`);
						terminal?.show(true);
						terminal?.sendText(`${prefixCommand} -b ${settings.OCCRootPath} -${context} "widget/${widgetName ? widgetName : _workspace.name}"`);
					} else {
						vscode.window.showWarningMessage(`O "${context === 'e' ? 'UOF Refresh Widget' : 'UOF Grab Widget'}" não foi executado. A pasta "${fsPath}" não foi reconhecida como um Widget!`);
					}
				}
			}
		} else {
			vscode.window.showWarningMessage(`O "${context === 'e' ? 'UOF Refresh Widget' : 'UOF Grab Widget'}" não foi executado. A pasta "${fsPath}" não foi reconhecida como um Widget!`);
		}
	} else {
		vscode.window.showWarningMessage(`O UOF Refresh Widget não foi executado. Clique com o botão direito do mouse sobre a pasta de um Widget válido!`);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }

// TODO: Criar ação para criar variáveis de ambiente via prompt de comando