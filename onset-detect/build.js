const shell = require("shelljs");

shell.rm("-rf", "dist");
shell.mkdir("dist");
shell.cp("index.html", "dist/index.html");
shell.cp("src/index.js", "dist/index.js");
shell.cp("audiosample.wav", "dist/audiosample.wav");
