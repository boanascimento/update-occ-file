// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { UpdateOCCFileSettings } from './models/updateOCCFileSettings.module';
import { } from 'chromedriver';
import { EEnv } from './extension.enum';
// var webdriver = require('selenium-webdriver');

const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
	'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif'
};


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const workspace = vscode.workspace;
	// const fsPath = vscode.workspace.fs.readDirectory;
	const baseCommand = "npm run send ";
	// const accessToken = "vpvg447hj2wekyz4x3dhrqgkepangyzfsiczsrbqjqjipqlywb6a";
	const OCCActionsTerminalName = "OCC actions";

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
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Update OCC File está ativo agora!');

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

						const terminal = vscode.window.activeTerminal;
						if (settings.OCCRootPath) {
							const apiAccessKey = validateEnvironmentPropertyApiKey(settings.environment.toLowerCase());
							const node = validateEnvironmentPropertyNode(settings.environment.toLowerCase());
							vscode.window.showInformationMessage(`Executando download do widget "${_workspace.name}".`);
							terminal?.sendText(`cd ${settings.OCCRootPath} && dcu -n ${node} -k ${apiAccessKey} -e "widget/${_workspace.name}"`);
						} else { 
							vscode.window.showErrorMessage(`É preciso informar o caminho(path) da pasta raiz do OCC para download do widget "${_workspace.name}" na propriedade "OCCRootPath" do arquivo "uofSettings.json".`);
						}
					} else { vscode.window.showErrorMessage(`Erro na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
				} else {
					vscode.window.showErrorMessage(`Você está no workspace "${_workspace.name}". O workspace selecionado no VSCode precisa ser o diretório do widget "${settings.widgetName}" definido no arquivo "uofSettings.json".`);
				}
			}
		});
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Update OCC File está ativo agora!');

	});

	/* Caso precise que seja salvo enviado ao salvar o arquivo. */
	context.subscriptions.push(disposable);
	context.subscriptions.push(getOCCWidget);
	context.subscriptions.push(workspace.onDidSaveTextDocument((td) => {
		const fileName = td.fileName;
		const terminal = vscode.window.activeTerminal;
		const _workspace = vscode.workspace.workspaceFolders![0];

		// terminal?.processId.then(tes => {

		// });
		// const time = `echo "${new Date().getDay()}-${new Date().getDate()}-${new Date().getFullYear()} [${new Date().getHours()}:${new Date().getMinutes()}]"`;
		// terminal?.sendText(`${time} && ${baseCommand}"${fileName}"`);


		workspace.findFiles(new vscode.RelativePattern(_workspace, "**/uofSettings.json"), "**/node_modules/**").then(results => {
			if (results[0]) {
				const jsonFile = results[0].fsPath;
				const data = fs.readFileSync(jsonFile);
				const settings = new UpdateOCCFileSettings(JSON.parse(data.toString()));
				if (_workspace.name === settings.widgetName) {
					if (settings.environment && settings.environment !== '') {
						const fileName = td.fileName;
						const terminal = vscode.window.activeTerminal;

						const apiAccessKey = validateEnvironmentPropertyApiKey(settings.environment.toLowerCase());
						const node = validateEnvironmentPropertyNode(settings.environment.toLowerCase());
						const time = `echo "${new Date().getDay()}-${new Date().getDate()}-${new Date().getFullYear()} [${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]"`;

						if (settings.environment.toLowerCase() === 'dev' || settings.environment.toLowerCase() === 'uat' || settings.environment.toLowerCase() === 'prd') {
							vscode.window.showInformationMessage(`Enviando arquivo "${fileName}"`);
							terminal?.sendText(`${time} && node ${settings.DCUPath} -n ${node} -k ${apiAccessKey} -t "${fileName}"`);
						} else { vscode.window.showErrorMessage(`Valor incorreto na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
					} else { vscode.window.showErrorMessage(`Erro na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
				} else { vscode.window.showErrorMessage(`O worspace selecionado no VSCode precisa ser o diretório do widget \`${settings.widgetName}\``); }
			}
		});
	}));

}

/**
 * Envia um arquivo para o OCC.
 * @param item Arquivo a ser enviado;
 * @param settings Configurações UOF do widget.
 */
function sendOCCFile(item: any, settings: UpdateOCCFileSettings) {
	if (settings.environment && settings.environment !== '') {
		const apiAccessKey = validateEnvironmentPropertyApiKey(settings.environment.toLowerCase());
		const node = validateEnvironmentPropertyNode(settings.environment.toLowerCase());

		const fileName = item.fsPath;
		const terminal = vscode.window.activeTerminal;
		const time = `echo "${new Date().getDay()}-${new Date().getDate()}-${new Date().getFullYear()} [${new Date().getHours()}:${new Date().getMinutes()}]"`;

		if (settings.environment.toLowerCase() === 'dev' || settings.environment.toLowerCase() === 'uat' || settings.environment.toLowerCase() === 'prd') {
			vscode.window.showInformationMessage(`Enviando arquivo "${fileName}"`);
			terminal?.sendText(`dcu -n ${node} -k ${apiAccessKey} -t "${fileName}"`);
		} else { vscode.window.showErrorMessage(`Valor incorreto na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
	} else { vscode.window.showErrorMessage(`Erro na propriedade "environment" no arquivo "uofSettings.json"! Favor revisar.`); }
}

/**
 * Verifica o ambiente e retorna a variável de ambiente para API Key.
 * @param environment Embiante de desenvolvimento.
 */
function validateEnvironmentPropertyApiKey(environment: string) {
	const env = EEnv;
	return environment === 'prd' ? env.prodApiKey : environment === 'uat' ? env.uatApiKey : environment === 'dev' ? env.devApiKey : 'error';
}

/**
 * Verifica o ambiente e retorna a variável de ambiente para o nó desejado.
 * @param environment Embiante de desenvolvimento.
 */
function validateEnvironmentPropertyNode(environment: string) {
	const env = EEnv;
	return environment === 'prd' ? env.prodNode : environment === 'uat' ? env.uatNode : environment === 'dev' ? env.devNode : 'error';
}

function getWebviewContent(cat: keyof typeof cats) {
	return `<webview>
	<iframe src="https://www.w3schools.com" width="100%" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin"></iframe></webview>`;
}

// this method is called when your extension is deactivated
export function deactivate() { }
