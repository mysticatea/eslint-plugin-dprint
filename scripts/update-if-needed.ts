import fs from "fs/promises"
import path from "path"
import { rm, sh } from "./lib/utils"

const RootPath = path.resolve(__dirname, "..")
const LibDprintPath = path.join(RootPath, "lib/dprint")
const TemporaryPluginsRootPath = path.join(RootPath, ".dprint-plugins")
const ReadmePath = path.join(RootPath, "README.md")
const ConfigSchemaPath = path.join(LibDprintPath, "config-schema.json")
const ImporterPath = path.join(LibDprintPath, "typescript.ts")
const DprintPluginRepositoryURL = "https://github.com/dprint/plugins.git"
const TypeScriptPluginFilenamePattern = /^typescript-(\d+\.\d+\.\d+)\.wasm$/u

type CurrentVersionInfo = {
    version: string
    wasmPath: string
}
type LatestReleaseInfo = {
    configSchemaPath: string
    version: string
    wasmPath: string
}

/**
 * Compare given two versions.
 * @param version1 A version text to compare.
 * @param version2 Another version text to compare.
 */
function compareSemver(version1: string, version2: string): -1 | 0 | 1 {
    const xs = version1.split(".")
    const ys = version2.split(".")

    for (let i = 0; i < 3; ++i) {
        const x = Number(xs[i])
        const y = Number(ys[i])
        if (x < y) {
            return -1
        }
        if (x > y) {
            return 1
        }
    }

    return 0
}

/**
 * Read the current version information.
 * It's came from `lib/dprint/typescript-X.Y.X.wasm` file's name.
 */
async function readCurrentVersion(): Promise<CurrentVersionInfo> {
    const filenames = await fs.readdir(LibDprintPath)

    for (const filename of filenames) {
        const m = TypeScriptPluginFilenamePattern.exec(filename)
        if (m) {
            return {
                version: m[1],
                wasmPath: path.join(LibDprintPath, filename),
            }
        }
    }

    throw new Error(
        `Failed to detect the current version of dprint-plugin-typescript. Files: ${
            filenames.join(", ")
        }`,
    )
}

/**
 * Read the latest release information.
 * It's came from `https://github.com/dprint/plugins` repository.
 */
async function readLatestVersion(): Promise<LatestReleaseInfo> {
    rm(TemporaryPluginsRootPath)
    sh(`git clone --depth 1 ${DprintPluginRepositoryURL} ${TemporaryPluginsRootPath}`)
    const filenames = await fs.readdir(TemporaryPluginsRootPath)
    let retv: LatestReleaseInfo | undefined

    for (const filename of filenames) {
        const m = TypeScriptPluginFilenamePattern.exec(filename)
        if (!m || (retv && compareSemver(retv.version, m[1]) >= 0)) {
            continue
        }
        const version = m[1]
        const [major] = version.split(".")
        const configSchemaPath = path.join(
            TemporaryPluginsRootPath,
            `schemas/typescript-v${major}.json`,
        )
        const wasmPath = path.join(TemporaryPluginsRootPath, filename)

        retv = { configSchemaPath, version, wasmPath }
    }
    if (retv) {
        return retv
    }

    throw new Error(`Stable release was not found: ${filenames.join(", ")}`)
}

/**
 * Update the config schema.
 * It's came from `.dprint-plugins/schemas/typescript-v0.json` file.
 * This function modifies it to adjust JSON Schema v4.
 * @param srcPath The path to the source code of the config schema.
 */
async function updateConfigSchema(srcPath: string): Promise<void> {
    console.log("Update %o", path.relative(process.cwd(), ConfigSchemaPath))

    const originalContent = await fs.readFile(srcPath, "utf8")
    const modifiedContent = originalContent
        .replace(/"\$schema":.+?\n\s*"\$id":.+?\n\s*/u, "")
        .replace(/"const": ([^,\n]+)/gu, '"enum": [$1]')

    await fs.writeFile(ConfigSchemaPath, modifiedContent)
}

/**
 * Update the wasm binary file.
 * It's came from `.dprint-plugins/typescript-*.wasm` file.
 * @param oldPath The path to the old wasm binary file to delete.
 * @param srcPath The path to the new wasm binary file to copy.
 */
async function updateWasmBinary(
    oldPath: string,
    srcPath: string,
): Promise<void> {
    const newPath = path.join(LibDprintPath, path.basename(srcPath))
    console.log(
        "Update %o → %o",
        path.relative(process.cwd(), oldPath),
        path.relative(process.cwd(), newPath),
    )

    await fs.writeFile(newPath, await fs.readFile(srcPath))
    await fs.unlink(oldPath)
}

/**
 * Replace the given text in the content of the given file.
 * @param filePath The path to the target file to replace its content.
 * @param oldText The text to be replaced.
 * @param newText The new text to be replaced with the old text.
 */
async function replaceTextInFile(
    filePath: string,
    oldText: string,
    newText: string,
): Promise<void> {
    console.log("Update %o", path.relative(process.cwd(), filePath))

    const oldContent = await fs.readFile(filePath, "utf8")
    const newContent = oldContent.split(oldText).join(newText)

    if (newContent !== oldContent) {
        await fs.writeFile(filePath, newContent)
    }
}

/**
 * Calculate the update kind between two given versions.
 * That's one of `major`, `minor`, and `patch`.
 * @param version1 A version text to compare.
 * @param version2 Another vresion text to compare.
 */
function calculateUpdateKind(version1: string, version2: string): string {
    const [major1, minor1] = version1.split(".")
    const [major2, minor2] = version2.split(".")

    if (major1 !== major2) {
        return "major"
    }
    if (minor1 !== minor2) {
        return "minor"
    }
    return "patch"
}

/**
 * Main logic.
 */
async function main(): Promise<string> {
    const current = await readCurrentVersion()
    const latest = await readLatestVersion()

    if (latest.version === current.version) {
        console.log(
            "The current version is %o; no update found.",
            current.version,
        )
        return "none"
    }
    console.log(
        "The current version is %o, the latest release is %o; need to upgrade that.",
        current.version,
        latest.version,
    )

    await updateConfigSchema(latest.configSchemaPath)
    await updateWasmBinary(current.wasmPath, latest.wasmPath)
    await replaceTextInFile(ImporterPath, current.version, latest.version)
    await replaceTextInFile(ReadmePath, current.version, latest.version)

    return calculateUpdateKind(current.version, latest.version)
}

// eslint-disable-next-line @mysticatea/ts/no-floating-promises
main()
    .catch(error => {
        console.error(error)
        process.exitCode = 1
        return "none"
    })
    .then(updateKind => {
        const updated = updateKind === "major" ||
            updateKind === "minor" ||
            updateKind === "patch"

        console.log("::set-output name=updated::%s", updated ? "yes" : "no")
        console.log("::set-output name=kind::%s", updateKind)
    })
