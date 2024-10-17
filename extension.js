// @ts-check
const vscode = require('vscode');
const dayjs = require('dayjs');
const utils = require('./utils');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "txtReader" is now active!');

	let pageIndex = context.globalState.get('pageIndex', 0);
	console.log('pageIndex', pageIndex);
	console.log('keys', context.globalState.keys());


	const statusBar0 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBar0.text = '$(open-preview)';
	statusBar0.command = 'txtReader.openFile';
	statusBar0.tooltip = '打开电子书(txt)';
	statusBar0.show();


	const statusBar1 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBar1.text = '$(chevron-left)';
	statusBar1.command = 'txtReader.prev';
	statusBar1.tooltip = '上一页(Alt + 3)';
	statusBar1.show();


	// debug-pause
	// debug-start
	let isPaused = context.globalState.get('isPaused', false);
	const statusBar2 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBar2.text = '$(debug-start)';
	statusBar2.command = 'txtReader.pause';
	statusBar2.tooltip = '继续';
	statusBar2.show();

	const statusBar3 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBar3.text = '$(chevron-right)';
	statusBar3.command = 'txtReader.next';
	statusBar3.tooltip = '下一页(Alt + 2)';
	statusBar3.show();


	const statusBar4 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBar4.text = '【0.00%】';
	statusBar4.tooltip = '当前页/总页数';
	statusBar4.command = 'txtReader.gotoPageByInput';
	statusBar4.show();
	// statusBar4.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');


	const statusBarText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

	statusBarText.show();


	const updateStatusBarTextTooltip = () => {
		// const tooltip = `当前页：${pageIndex + 1}/${contentArray.length}`;
		const filePath = context.globalState.get('filePath', '');
		statusBarText.tooltip = filePath;
	}



	const statusBars = [statusBar0, statusBar1, statusBar2, statusBar3, statusBar4, statusBarText];


	let timer;


	const config = vscode.workspace.getConfiguration();
	const filePath = context.globalState.get('filePath', '');
	const interval = config.get("txtReader.interval", 3000);
	// const encoding = context.globalState.get('encoding');
	// config.update('txtReader.encoding', encoding);
	
	let contentArray = [];
	
	const openFile = () => {
		const config = vscode.workspace.getConfiguration();
		const splitNumber = config.get('txtReader.splitNumber', 40);
		const filePath = context.globalState.get('filePath', '');
		const encode = config.get("txtReader.encoding");			

		fs.readFile(path.resolve(filePath),{encoding: 'binary'}, (err, data) => {
			if (err) {
				console.error(err);
				return;
			}

			var buf =  Buffer.from(data,'binary');
			var txt = iconv.decode(buf, encode);

			contentArray = [];
			let content = txt.replace(/[\r\n\s+]/g, ' ');
			let chunk = content.slice(0, splitNumber)
			let rest = content.slice(splitNumber)
	
			contentArray.push(chunk)
			while (rest.length > 0) {
				chunk = rest.slice(0, splitNumber)
				rest = rest.slice(splitNumber)
				contentArray.push(chunk)
			}
			
			// 更新内容
			statusBarText.text = contentArray[pageIndex] ?? '[Empty]';
			updatePercentage();
		})
	}

	if (filePath) {
		openFile();
	}

	


	const updatePercentage = () => {
		const percentage = (((pageIndex + 1) / (contentArray.length-1)) * 100).toFixed(2);
		statusBar4.text = `【${percentage}%】(${pageIndex}/${contentArray.length-1})`;
	}


	const gotoPage = (page) => {
		page = parseInt(page);
		if (Number.isNaN(page) || page < 0 || page > contentArray.length-1) {
			vscode.window.showErrorMessage(`请输入正确的页码`);
			return
		}
		pageIndex = page;
		context.globalState.update('pageIndex', pageIndex);
		statusBarText.text = contentArray[pageIndex];
		updatePercentage();
	}



	const disposable8 = vscode.commands.registerCommand('txtReader.gotoPageByInput', async function () {
		const p = await vscode.window.showInputBox({
			prompt: '请输入页码',
			value: String(pageIndex),
			valueSelection: [0, pageIndex.toString().length]
		})
		gotoPage(p);
	});



	// 监听配置变化  
    vscode.workspace.onDidChangeConfiguration(event => {  
		const config = vscode.workspace.getConfiguration();
        if (event.affectsConfiguration('txtReader.encoding')) {  
			const newSetting = config.get('txtReader.encoding');
            console.log(`My Extension Setting Changed: ${newSetting}`);
			openFile();
        }
    });  

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('txtReader.openFile', async function () {

		const uri = await vscode.window.showOpenDialog({  
			canSelectFiles: true,  
			canSelectFolders: false,  
			canSelectMany: false, // 设置为true以允许多选  
			openLabel: 'Select', // 自定义按钮标签  
			filters: { // 可选的文件类型过滤器  
				'Text Files': ['txt', 'md']  
			}
		});

		if (!uri) {  
			// 用户取消选择  
			return;  
		}  

		// 获取选择的文件路径（第一个元素，因为我们设置了canSelectMany: false）  
		const filePath = uri[0].fsPath;  

		// 在此处处理文件路径，例如打开文件、读取内容等  
		console.log('Selected file: ' + filePath);  

		context.globalState.update('filePath', filePath);

		// 重新打开文件
		contentArray = [];
		pageIndex = 0;
		context.globalState.update('pageIndex', pageIndex);
		openFile();
		updateStatusBarTextTooltip();
	});


	const disposable2 = vscode.commands.registerCommand('txtReader.prev', function () {
		let visible = context.globalState.get('visible');
		if (!visible) {
			return
		}
		
		if (pageIndex === 0) {
			return
		}
		pageIndex--;
		context.globalState.update('pageIndex', pageIndex);
		statusBarText.text = contentArray[pageIndex];
		updatePercentage();
		updateStatusBarTextTooltip();
	});

	const disposable3 = vscode.commands.registerCommand('txtReader.pause', function () {
		if (isPaused) {
			statusBar2.text = '$(debug-start)';
			statusBar2.tooltip = '继续';
			isPaused = false;
			clearInterval(timer);
		} else {
			statusBar2.text = '$(debug-pause)';
			statusBar2.tooltip = '暂停';
			isPaused = true;
			timer = setInterval(() => {
				vscode.commands.executeCommand('txtReader.next');
			}, interval);
		}

		context.globalState.update('isPaused', isPaused);
	});

	const disposable4 = vscode.commands.registerCommand('txtReader.next', function () {
		let visible = context.globalState.get('visible');
		if (!visible) {
			return
		}

		if (pageIndex === contentArray.length - 1) {
			return
		}
		pageIndex++;
		context.globalState.update('pageIndex', pageIndex);
		statusBarText.text = contentArray[pageIndex];
		updatePercentage();
		updateStatusBarTextTooltip();
	});
	const disposable5 = vscode.commands.registerCommand('txtReader.show', function () {
		statusBars.forEach(statusBar => {
			statusBar.show();
		});
	});

	const disposable6 = vscode.commands.registerCommand('txtReader.hide', function () {
		statusBars.forEach(statusBar => {
			statusBar.hide();
		});
	});


	let visible = context.globalState.get('visible', true);
	const disposable7 = vscode.commands.registerCommand('txtReader.toggleDisplay', function () {
		if (visible) {
			vscode.commands.executeCommand('txtReader.hide');
			visible = false;
		} else {
			vscode.commands.executeCommand('txtReader.show');
			visible = true;
		}
		context.globalState.update('visible', visible);
	});


	context.subscriptions.push(disposable, disposable2, disposable3, disposable4, disposable5, disposable6, disposable7, disposable8);

}

function deactivate() {
	console.log('txtReader extension is now deactivated');
}

module.exports = {
	activate,
	deactivate
}
