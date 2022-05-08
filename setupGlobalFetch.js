const fetch = require("isomorphic-fetch");

global.window.fetch = fetch; //replace the global window fetch with isomorphic fetch;
