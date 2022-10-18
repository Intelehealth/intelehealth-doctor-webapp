// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  const process = require("process");
  process.env.CHROME_BIN = require("puppeteer").executablePath();

  config.set({
    basePath: "",
    frameworks: ["parallel", "jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-parallel"),
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage-istanbul-reporter"),
      require("karma-sonarqube-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
      "karma-spec-reporter",
      "karma-jquery",
    ],
    parallelOptions: {
      executors: 2, // putting only 4 executors (these are logical threads which is double of cores) as of now to not stress out the dev machine to its peek
    },
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    files: [],
    preprocessors: {},
    mime: {
      "text/x-typescript": ["ts", "tsx"],
    },
    coverageIstanbulReporter: {
      dir: require("path").join(__dirname, "../coverage/ih"),
      reports: ["html", "lcovonly", "text-summary", "json-summary","coverage"],
      fixWebpackSourcePaths: true,
      thresholds: {
        statements: 1,
        lines: 0,
        branches: 0,
        functions: 1,
      },
    },
    angularCli: {
      environment: "dev",
    },
    // reporters: ["spec"],
    reporters: ["spec", "progress", "kjhtml", "sonarqube"],
    sonarqubeReporter: {
      basePath: "src/app", // test files folder
      filePattern: "**/*spec.ts", // test files glob pattern
      encoding: "utf-8", // test files encoding
      outputFolder: "reports", // report destination
      legacyMode: false, // report for Sonarqube < 6.2 (disabled)
      reportName: function (metadata) {
        // report name callback, but accepts also a
        // string (file name) to generate a single file
        /**
         * Report metadata array:
         * - metadata[0] = browser name
         * - metadata[1] = browser version
         * - metadata[2] = plataform name
         * - metadata[3] = plataform version
         */
        return "sonarqube_report.xml";
      },
    },
    specReporter: {
      maxLogLines: 5, // limit number of lines logged per test
      suppressErrorSummary: true, // do not print error summary
      suppressFailed: false, // do not print information about failed tests
      suppressPassed: false, // do not print information about passed tests
      suppressSkipped: true, // do not print information about skipped tests
      showSpecTiming: false, // print the time elapsed for each spec
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: true,
    browsers: ["ChromeHeadless"],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
    },
    captureTimeout: 60000, // it was already there
    browserDisconnectTimeout: 100000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 60000, //by default 10000
    singleRun: false,
    restartOnFileChange: true,
  });
};
