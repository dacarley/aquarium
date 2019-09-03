/* eslint-disable @typescript-eslint/no-unused-vars */
require("source-map-support").install();
require("tsconfig-paths").register();

import Express from "@/express";
import MainLoop from "@/mainLoop";

Express.init();
MainLoop.run();
