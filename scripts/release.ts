import { version as rawVersion } from "../package.json"
import { cd, rm, sh, stdoutOf } from "./lib/utils"

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

const originUrl = stdoutOf("git remote get-url origin")
const branch = stdoutOf("git symbolic-ref --short HEAD")
const version = branch === "master" ? rawVersion : `${rawVersion}-${branch}`
const sha1 = stdoutOf('git log -1 --format="%h"')
const commitMessage = `🔖 ${version} (built with ${sha1})`

// ------------------------------------------------------------------------------
// Main
// ------------------------------------------------------------------------------

// Push
sh("git push origin master")

// Delete the tag `npm version` created to use it for the release commit.
try {
    sh(`git tag -d "v${rawVersion}"`)
} catch (ignore) {
    // Ignore
}

// Make the release commit that contains only `dist` directory.
cd("dist")
sh("git init")
try {
    sh("git add .")
    sh(`git commit -m "${commitMessage}"`)
    sh(`git tag "v${version}"`)
    sh(`git push "${originUrl}" "v${version}"`)
    sh("npm publish")
} finally {
    // Clean
    rm(".git")
    cd("..")
    sh("git fetch --tags")
}
