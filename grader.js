#!/usr/bin/env node
/*
 * Automatically grade files for the presence of specified HTML tags/attributes.
 * Uses commander.js and cheerio. Teaches command line application development
 * and basic DOM parsing.
 *
 * References:
 *
 *  + cheerio
 *     - https://github.com/MatthewMueller/cheerio
 *        - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
 *           - http://maxogden.com/scraping-with-node.html
 *
 *            + commander.js
 *               - https://github.com/visionmedia/commander.js
 *                  - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy
 *
 *                   + JSON
 *                      - http://en.wikipedia.org/wiki/JSON
 *                         - https://developer.mozilla.org/en-US/docs/JSON
 *                            - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 *                            */

var fs = require('fs');
var restler = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
        var instr = infile.toString();
            if(!fs.existsSync(instr)) {
                        console.log("%s does not exist. Exiting.", instr);
                                process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
                                    }
                                        return instr;
};

var cheerioHtmlFile = function(htmlfile) {
        return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
        return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function($, checksfile) {
            var checks = loadChecks(checksfile).sort();
                var out = {};
                    for(var ii in checks) {
                                var present = $(checks[ii]).length > 0;
                                        out[checks[ii]] = present;
                                            }
                                                return out;
};

var checkJSON = function(html, checksFile)
{
    var checkJson = checkHtmlFile(html, checksFile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

if(require.main == module) {
        program
                .option('-c, --checks <check_file>', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
                .option('-f, --file <index_file>', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
                .option('-u, --url <url>', '<url> The URL to a html file to be checked.')
                .parse(process.argv);

	var checksFile = program.checks;
        if (program.url)
        {
		var url = program.url;
		restler.get(url).on('complete', function(data)
		{
			var $ = cheerio.load(data);
			checkJSON($, checksFile);
		});
        }
        else
        {
		var $ = cheerioHtmlFile(program.file);
		checkJSON($, checksFile);
        }
} else {
        exports.checkHtmlFile = checkHtmlFile;
}
