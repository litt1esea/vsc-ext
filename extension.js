// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const dayjs = require('dayjs');
const utils = require('./utils');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let t = null


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "yhl" is now active!');

	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBar.text = '$(watch) 编辑器打开时长: 00:00:00';
	statusBar.show();


	const startTime = Date.now();

	t = setInterval(() => {
		const nowTime = Date.now();
		// 毫秒转化为时分秒
		const { hours, minutes, seconds} = utils.formatMilliseconds(nowTime - startTime)

		statusBar.text = `$(watch) 编辑器打开时长: ${ hours}:${ minutes}:${ seconds}`;

	}, 1000)


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('yhl.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from yhl');

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {
	console.log('yhl extension is now deactivated');
	clearInterval(t)
}

module.exports = {
	activate,
	deactivate
}
