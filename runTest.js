const { exec } = require('child_process');
const {initTestOptions, testResults} = require('./k6Wrapper')


// - testOptions.configFile: default value is './config.json' but this variable can be used to load saved
//		configuration files.

// - testOptions.summaryOutput: output of the test. 'datetime', 'date', and 'time' are variables names 
//		not to be used unless they are meant to be replaced by the current timestamp, date, 
//		and time respectively. Same goes for testOptions.jsonOutput.

// - testOptions.duration: duration of the test. use 's' or 'm' as a suffix to specify 
//		the test duration units (seconds or minutes).

// - testOptions.iterations: number of total requests to performe over all the virtual users together.


const testOptions = new initTestOptions({
	logPath: './logs/config-{date}-{time}',
	configFile: 'config.json',
	summaryOutput: 'testSummary-{date}-{time}', 
	jsonOutput: 'testDetails-{datetime}', 
	duration: '1m',
	iterations: 10000,
	vus: 1000,
	script: 'serverTest.js'
});


const testOutput = new testResults();


const k6Test = exec('"k6"' + testOptions.cmdArguments);

k6Test.stdout.on('data', (data) => {
  testOutputLines = testOutput.printTestOutput(data);
});

k6Test.stderr.on('data', (data) => {
  //console.error(`stderr: ${data}`);
});

k6Test.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});