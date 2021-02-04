
const fs = require('fs');
const { stdin, stdout } = require('process');
const readline = require('readline');



module.exports = {
	initTestOptions: class initTestOptions {
		constructor(options) {
			this.opts = [];
			this.cmdArguments = '';
			var summary = options.summaryOutput;
			this.opts.logPath =  (options.logPath == undefined) ? './config-{date}-{time}' : options.logPath;
			this.opts.configFile =  (options.configFile == undefined) ? 'config.json' : options.configFile;
			this.opts.summaryOutput =  (summary == undefined) ? 'testSummary-{date}-{time}' : summary;
			this.opts.jsonOutput =  (options.jsonOutput == undefined) ? 'testDetails-{datetime}' : options.jsonOutput;
			this.opts.duration =  (options.duration == undefined) ? '1m' : options.duration;
			this.opts.iterations =  (options.iterations == undefined) ? 10000 : options.iterations;
			this.opts.vus =  (options.vus == undefined) ? 1000 : options.vus;
      this.opts.script =  (options.script == undefined) ? 'serverTest.js' : options.script;
			this.replaceDateTime();
			this.generateCMD();
			this.saveConfiguration();
		}


		generateCMD = () => {
			this.replaceDateTime();
			var cmdArg = ' run';
			cmdArg += ' --summary-export=' + this.opts.logPath + '/' + this.opts.summaryOutput + '.txt';
			cmdArg += ' --out json=' + this.opts.logPath + '/' + this.opts.jsonOutput + '.txt';
			cmdArg += ' --config=' + this.opts.logPath + '/' + this.opts.configFile;
			cmdArg += ' serverTest.js';
			this.cmdArguments = cmdArg;
		}


		saveConfiguration = () => {
      var directories = this.opts.logPath.split('/');
      for (let dir = 0; dir < directories.length; dir++) {
        if (!fs.existsSync(directories[dir]) && directories[dir] != '.') 
          fs.mkdirSync(directories[dir]);
        if (dir + 1 < directories.length)
          directories[dir + 1] = directories[dir] + '/' + directories[dir + 1];
      }
			var configFilePath = this.opts.logPath + '/' + this.opts.configFile;
			var configText = '{\n'
			configText += '\t"duration":"' + this.opts.duration + '",\n';
			configText += '\t"iterations":' + this.opts.iterations + ',\n';
			configText += '\t"vus":' + this.opts.vus + '\n';
			configText += '}'
			fs.writeFileSync(configFilePath, configText);
		}


		replaceDateTime = (text) => {
			var dateTime = [];
			var curDate = '_' + new Date().toLocaleDateString();
			var curTime = '_' + new Date().toLocaleTimeString();
			var curDateTime = '_' + new Date().toLocaleString().replace(',', '');
			[curDate, curTime, curDateTime].forEach((value, index, array) => {
				while(array[index].search(':') != -1 || array[index].search('/') != -1)
					array[index] = array[index].replace(':', '-').replace('/', '-').replace(' ', '_');
				dateTime[index] = array[index];
			});
			[curDate, curTime, curDateTime] = dateTime;
			var option;
			for (option in this.opts) {
				if (typeof this.opts[option] == 'string') {
					while (this.opts[option].search(/{date}/i) != -1)
						this.opts[option] = this.opts[option].replace(/-{date}/i, curDate);
					while (this.opts[option].search(/{time}/i) != -1)
						this.opts[option] = this.opts[option].replace(/-{time}/i, curTime);
					while (this.opts[option].search(/{datetime}/i) != -1)
						this.opts[option] = this.opts[option].replace(/-{datetime}/i, curDateTime);
				}
			};
		}
	},


  
  testResults: class testResults {
    constructor() {
      this.testResults = [
        [/Init/gi, /VUs/gi, /initialized/gi, /default/gi],
        [/running/gi, /VUs/gi, /complete and/gi, /interrupted iterations/gi, /default/gi, /VUs/gi, /shared iters/gi]
      ];
      this.cursorPos = [];
      this.testResults.forEach((value, index, array) => {
      });
    }


    printTestOutput = (data) => {
      var repeatition = [], searchData = data, results = '';
      this.testResults.forEach((value, resultId, array) => {
        this.cursorPos.push([0,0]);
        repeatition.push(new Array(this.testResults[resultId].length + 1));
        repeatition[resultId].fill(0);
        this.testResults[resultId].forEach((value, index, array) => {
          if (repeatition[resultId][0] == index) {
            if (new RegExp(this.testResults[resultId][index]).exec(searchData)) {
              repeatition[resultId][0]++;
              repeatition[resultId][index + 1] = new RegExp(this.testResults[resultId][index]).exec(data);
              searchData = data.slice(repeatition[resultId][index + 1].index - data.length);
            }
          }
        });
        if (repeatition[resultId][0] == this.testResults[resultId].length) {
          if (this.cursorPos[resultId][0] == 1) {
            process.stdout.cursorTo(0);
            process.stdout.clearLine()
          } else {
            this.cursorPos[resultId][0] = 1;
            results += '\n';
          }
          results += this.parseResults(repeatition, resultId, data);
        } else  this.cursorPos[resultId][0] = 0;
      })
      if (results == '') results = data;
      process.stdout.write(results);
    }


    parseResults = (repeatition, resultId, data) => {
      var results = '';
      if (resultId == 0)
        results = data.trim().replace('\n', '. ');
      else if (resultId == 1)
        results = data.trim().replace('\n', '. ');
      return results;
    }
  }
}