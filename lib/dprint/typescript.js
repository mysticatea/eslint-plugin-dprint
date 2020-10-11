"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("eslint:plugin-dprint");
// Load `dprint-plugin-typescript`.
const TSPluginPath = path_1.default.join(__dirname, "typescript-0.32.4.wasm");
const TSPluginModule = new WebAssembly.Module(fs_1.default.readFileSync(TSPluginPath));
const TSPluginInstance = new WebAssembly.Instance(TSPluginModule, {});
const TSPlugin = TSPluginInstance.exports;
const BufferSize = TSPlugin.get_wasm_memory_buffer_size();
/** Cache to reduce copies of config values. */
let lastConfig;
/**
 * Format the given text with the given config.
 * @param config The config object.
 * @param filePath The path to the file.
 * @param fileText The content of the file.
 * @returns The formatted text or undefined. It's undefined if the formatter doesn't change the text.
 */
function format(config, filePath, fileText) {
    if (config !== lastConfig) {
        lastConfig = config;
        writeConfig(config);
    }
    writeFilePath(filePath);
    writeString(fileText);
    const retv = TSPlugin.format();
    switch (retv) {
        case 0: // no change
            return undefined;
        case 1: // change
            return readFormattedText();
        case 2: // error
            debug("FAILED TO FORMAT: %s", readErrorText());
            return undefined;
        default:
            debug("FAILED TO FORMAT: Unknown response code (%d)", retv);
            return undefined;
    }
}
exports.format = format;
/**
 * Write the config to the plugin.
 * @param config The config object.
 */
function writeConfig(config) {
    TSPlugin.reset_config();
    // The setting values must be strings.
    const pluginConfig = {};
    for (const [key, value] of Object.entries(config)) {
        pluginConfig[key] = String(value);
    }
    writeString("{}");
    TSPlugin.set_global_config();
    writeString(JSON.stringify(pluginConfig));
    TSPlugin.set_plugin_config();
}
/**
 * Write the file path to the plugin.
 * @param value The path to the file.
 */
function writeFilePath(value) {
    writeString(value);
    TSPlugin.set_file_path();
}
/**
 * Read the text that the last `TSPlugin.format()` call formatted.
 * @returns The formatted text.
 */
function readFormattedText() {
    return readString(TSPlugin.get_formatted_text());
}
/**
 * Read the error message that the last `TSPlugin.format()` call caused.
 * @returns The error message.
 */
function readErrorText() {
    return readString(TSPlugin.get_error_text());
}
/**
 * Write a string to the plugin.
 * @param text The text to write.
 */
function writeString(text) {
    const buffer = Buffer.from(text, "utf8");
    const length = buffer.byteLength;
    TSPlugin.clear_shared_bytes(length);
    let index = 0;
    while (index < length) {
        const writeCount = Math.min(length - index, BufferSize);
        buffer.copy(new Uint8Array(TSPlugin
            .memory
            .buffer, TSPlugin.get_wasm_memory_buffer(), writeCount), 0, index, index + writeCount);
        TSPlugin.add_to_shared_bytes_from_buffer(writeCount);
        index += writeCount;
    }
}
/**
 * Read a text from the plugin.
 * @param length The byte length of the string.
 * @returns The read text.
 */
function readString(length) {
    const buffer = Buffer.allocUnsafe(length);
    let index = 0;
    while (index < length) {
        const readCount = Math.min(length - index, BufferSize);
        TSPlugin.set_buffer_with_shared_bytes(index, readCount);
        buffer.set(new Uint8Array(TSPlugin
            .memory
            .buffer, TSPlugin.get_wasm_memory_buffer(), readCount), index);
        index += readCount;
    }
    return buffer.toString("utf8");
}
//# sourceMappingURL=typescript.js.map